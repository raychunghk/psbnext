'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  NumberInput,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { Report } from '@/types/report';

const API_BASE = '/next/api';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [ranks, setRanks] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [newName, setNewName] = useState<string>('');
  const [newRank, setNewRank] = useState<number | string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState<number>(0);

  useEffect(() => {
    const loadReports = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await axios.get<Report[]>(`${API_BASE}/psb/reports`);
        const enabled = (response.data || [])
          .filter((r) => (r.Status ?? '').toLowerCase() === 'enable')
          .sort((a, b) => (a.Rank ?? 0) - (b.Rank ?? 0));
        setReports(enabled);
        setRanks(
          enabled.reduce<Record<number, number>>((acc, r) => {
            acc[r.ReportID] = r.Rank ?? 0;
            return acc;
          }, {})
        );
        const maxRank = enabled.reduce(
          (max, r) => Math.max(max, r.Rank ?? 0),
          0
        );
        setNewRank(maxRank + 1);
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: axios.isAxiosError(error)
            ? error.response?.data?.message || error.message
            : 'Failed to load reports',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, [refresh]);

  const saveRank = async (report: Report): Promise<void> => {
    const rank = ranks[report.ReportID];
    if (rank === report.Rank) {
      return;
    }
    try {
      setSavingId(report.ReportID);
      await axios.post(`${API_BASE}/psb/reports/${report.ReportID}/rank`, {
        rank,
      });
      notifications.show({
        title: 'Success',
        message: 'The ranking has been updated.',
        color: 'green',
      });
      setReports((prev) =>
        prev.map((r) =>
          r.ReportID === report.ReportID ? { ...r, Rank: rank } : r
        )
      );
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Failed to update ranking',
        color: 'red',
      });
    } finally {
      setSavingId(null);
    }
  };

  const addReport = async (): Promise<void> => {
    if (!newName.trim()) {
      notifications.show({
        message: 'Please input the Report Name.',
        color: 'red',
      });
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(`${API_BASE}/psb/reports`, {
        name: newName.trim(),
        rank: Number(newRank) || 0,
      });
      notifications.show({
        title: 'Success',
        message: 'The report has been added.',
        color: 'green',
      });
      setNewName('');
      setRefresh((n) => n + 1);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Failed to add report',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReport = async (report: Report): Promise<void> => {
    try {
      await axios.post(`${API_BASE}/psb/reports/${report.ReportID}/delete`);
      notifications.show({
        title: 'Success',
        message: 'The report has been deleted.',
        color: 'green',
      });
      setReports((prev) => prev.filter((r) => r.ReportID !== report.ReportID));
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Failed to delete report',
        color: 'red',
      });
    }
  };

  const confirmDelete = (report: Report): void => {
    modals.openConfirmModal({
      title: 'Delete report',
      children: (
        <Text size="sm">
          Are you sure you want to delete &quot;{report.ReportName}&quot;?
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteReport(report),
    });
  };

  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Box style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          <Stack gap="md">
            <Title order={3} ta="center">
              Add / Delete a Report
            </Title>

            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 140 }}>Ranking</Table.Th>
                  <Table.Th>Report</Table.Th>
                  <Table.Th style={{ width: 80, textAlign: 'center' }}>
                    Action
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reports.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={3} style={{ textAlign: 'center' }}>
                      <Text c="dimmed" py="sm">
                        No reports found.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  reports.map((report) => (
                    <Table.Tr key={report.ReportID}>
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          <NumberInput
                            w={70}
                            min={0}
                            value={ranks[report.ReportID] ?? 0}
                            onChange={(value) =>
                              setRanks((prev) => ({
                                ...prev,
                                [report.ReportID]: Number(value) || 0,
                              }))
                            }
                            allowNegative={false}
                            hideControls
                          />
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            loading={savingId === report.ReportID}
                            disabled={ranks[report.ReportID] === report.Rank}
                            onClick={() => saveRank(report)}
                            aria-label="Save ranking"
                          >
                            <IconDeviceFloppy size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                      <Table.Td>{report.ReportName ?? '-'}</Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Group justify="center" gap={0}>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => confirmDelete(report)}
                            aria-label="Delete report"
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>

            <Group align="flex-end" gap="sm">
              <NumberInput
                label="Ranking"
                w={100}
                min={0}
                value={newRank}
                onChange={setNewRank}
                allowNegative={false}
                hideControls
              />
              <TextInput
                style={{ flex: 1 }}
                label="New Report"
                placeholder="Enter report name"
                value={newName}
                maxLength={100}
                onChange={(event) => setNewName(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    addReport();
                  }
                }}
              />
              <Button
                onClick={addReport}
                loading={submitting}
                leftSection={<IconPlus size={18} />}
                style={{ backgroundColor: '#2665E5' }}
              >
                Add
              </Button>
            </Group>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
