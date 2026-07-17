'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Container,
  Paper,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table-open';
import {
  ReportDistrictChange,
  ReportDistrictMatrix,
} from '@/types/report';

const API_BASE = '/next/api';
const REPORT_COL = 'reportName';
const DIRTY_BG = '#fff3bf';

interface District {
  DistrictID: number;
  DistrictName: string | null;
}

type MatrixRow = {
  reportId: number;
  reportName: string;
  [districtKey: string]: string | number;
};

const districtKey = (districtId: number): string => `d_${districtId}`;
const cellKey = (reportId: number, districtId: number): string =>
  `${reportId}_${districtId}`;

// The mapping table stores absent relations as the sentinel string 'null';
// display those as empty and treat empty input as 'null' on save.
const normalize = (value: string): string =>
  value.trim().toLowerCase() === 'null' ? '' : value;

// The canonical form a typed value takes once persisted and reloaded: the
// backend trims and maps empty/whitespace/'null' to the sentinel, which
// `normalize` then renders as empty. Keep the in-memory baseline in this form
// so the dirty state and displayed value match what a reload would show.
const canonical = (value: string): string => normalize(value.trim());

export default function ModifyReportPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [data, setData] = useState<MatrixRow[]>([]);
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const loadMatrix = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await axios.get<ReportDistrictMatrix>(
          `${API_BASE}/psb/report-district/matrix`
        );
        const { reports, districts: cols, values } = response.data;

        const lookup: Record<string, string> = {};
        for (const v of values) {
          lookup[cellKey(v.ReportID, v.DistrictID)] = normalize(
            v.rel_Value ?? ''
          );
        }

        const rows: MatrixRow[] = reports.map((report) => {
          const row: MatrixRow = {
            reportId: report.ReportID,
            reportName: report.ReportName ?? `Report ${report.ReportID}`,
          };
          for (const col of cols) {
            row[districtKey(col.DistrictID)] =
              lookup[cellKey(report.ReportID, col.DistrictID)] ?? '';
          }
          return row;
        });

        const baseline: Record<string, string> = {};
        for (const report of reports) {
          for (const col of cols) {
            baseline[cellKey(report.ReportID, col.DistrictID)] =
              lookup[cellKey(report.ReportID, col.DistrictID)] ?? '';
          }
        }

        setDistricts(cols);
        setData(rows);
        setOriginal(baseline);
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: axios.isAxiosError(error)
            ? error.response?.data?.message || error.message
            : 'Failed to load the report-district table',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };
    loadMatrix();
  }, []);

  const handleCellChange = useCallback(
    (reportId: number, districtId: number, value: string): void => {
      setData((prev) =>
        prev.map((row) =>
          row.reportId === reportId
            ? { ...row, [districtKey(districtId)]: value }
            : row
        )
      );
    },
    []
  );

  const changes = useMemo<ReportDistrictChange[]>(() => {
    const list: ReportDistrictChange[] = [];
    for (const row of data) {
      for (const district of districts) {
        const key = districtKey(district.DistrictID);
        const current = String(row[key] ?? '');
        const base = original[cellKey(row.reportId, district.DistrictID)] ?? '';
        if (current !== base) {
          list.push({
            reportId: row.reportId,
            districtId: district.DistrictID,
            value: current,
          });
        }
      }
    }
    return list;
  }, [data, districts, original]);

  const columns = useMemo<MRT_ColumnDef<MatrixRow>[]>(() => {
    const cols: MRT_ColumnDef<MatrixRow>[] = [
      {
        accessorKey: REPORT_COL,
        header: 'Report \\ District',
        size: 240,
        minSize: 180,
        enableColumnFilter: true,
        Cell: ({ cell }) => (
          <Text fw={600} size="sm">
            {cell.getValue<string>()}
          </Text>
        ),
      },
    ];

    for (const district of districts) {
      const key = districtKey(district.DistrictID);
      cols.push({
        accessorKey: key,
        header: district.DistrictName ?? `District ${district.DistrictID}`,
        size: 150,
        minSize: 110,
        Cell: ({ row }) => {
          const reportId = row.original.reportId;
          const value = String(row.original[key] ?? '');
          const base = original[cellKey(reportId, district.DistrictID)] ?? '';
          const dirty = value !== base;
          return (
            <TextInput
              size="xs"
              value={value}
              onChange={(event) =>
                handleCellChange(
                  reportId,
                  district.DistrictID,
                  event.currentTarget.value
                )
              }
              styles={
                dirty
                  ? {
                      input: {
                        backgroundColor: DIRTY_BG,
                        borderColor: '#f08c00',
                      },
                    }
                  : undefined
              }
            />
          );
        },
      });
    }

    return cols;
  }, [districts, original, handleCellChange]);

  const handleSave = async (): Promise<void> => {
    if (changes.length === 0) {
      return;
    }
    try {
      setSaving(true);
      await axios.post(`${API_BASE}/psb/report-district/batch-update`, {
        changes,
      });
      notifications.show({
        title: 'Success',
        message: 'The records have been updated.',
        color: 'green',
      });
      // Reset both the displayed cells and the dirty baseline to the canonical
      // (trimmed + sentinel-normalized) form the server actually persisted, so
      // the grid clears its dirty state and matches what a reload would show.
      const saved = new Map(
        changes.map((change) => [
          cellKey(change.reportId, change.districtId),
          canonical(change.value),
        ])
      );
      setData((prev) =>
        prev.map((row) => {
          let updated: MatrixRow | null = null;
          for (const district of districts) {
            const key = cellKey(row.reportId, district.DistrictID);
            if (saved.has(key)) {
              updated = updated ?? { ...row };
              updated[districtKey(district.DistrictID)] = saved.get(key) ?? '';
            }
          }
          return updated ?? row;
        })
      );
      setOriginal((prev) => {
        const next = { ...prev };
        for (const [key, value] of saved) {
          next[key] = value;
        }
        return next;
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Failed to save changes',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const table = useMantineReactTable({
    columns,
    data,
    enableColumnPinning: true,
    enableStickyHeader: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableFacetedValues: true,
    enablePagination: false,
    enableRowVirtualization: data.length > 30,
    getRowId: (row) => String(row.reportId),
    initialState: {
      density: 'xs',
      columnPinning: { left: [REPORT_COL] },
    },
    state: { isLoading: loading },
    mantineTableContainerProps: { style: { maxHeight: '70vh' } },
    mantinePaperProps: { withBorder: true, shadow: 'sm', radius: 'md' },
    mantineTableProps: {
      style: { width: '100%' },
    },
    mantineTableHeadCellProps: {
      style: {
        paddingTop: 6,
        paddingBottom: 6,
        backgroundColor: '#2f4b7c',
        color: '#ffffff',
        borderRight: '1px solid rgba(255, 255, 255, 0.25)',
      },
    },
    mantineTableBodyCellProps: {
      style: {
        paddingTop: 2,
        paddingBottom: 2,
        borderRight: '1px solid var(--mantine-color-gray-3)',
      },
    },
    renderTopToolbarCustomActions: () => (
      <Button
        onClick={handleSave}
        loading={saving}
        disabled={changes.length === 0}
        leftSection={<IconDeviceFloppy size={18} />}
        style={{ backgroundColor: changes.length === 0 ? undefined : '#2665E5' }}
      >
        {changes.length > 0
          ? `Save Changes (${changes.length})`
          : 'Save Changes'}
      </Button>
    ),
  });

  return (
    <Container fluid px="md" py="lg">
      <Title order={3} ta="center" mb="md">
        Modify the Report-District Table
      </Title>

      {!loading && (data.length === 0 || districts.length === 0) ? (
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Text ta="center" c="dimmed">
            No data found. Please add reports and districts first.
          </Text>
        </Paper>
      ) : (
        <MantineReactTable table={table} />
      )}
    </Container>
  );
}
