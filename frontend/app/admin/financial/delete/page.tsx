'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  ActionIcon,
  Anchor,
  Box,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconDownload, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { Report, ReportDetail } from '@/types/report';

const API_BASE = '/next/api';

export default function DeleteReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportId, setReportId] = useState<string | null>(null);
  const [details, setDetails] = useState<ReportDetail[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  useEffect(() => {
    const loadReports = async (): Promise<void> => {
      try {
        setLoadingReports(true);
        const response = await axios.get<Report[]>(`${API_BASE}/psb/reports`);
        const enabled = (response.data || [])
          .filter((r) => (r.Status ?? '').toLowerCase() === 'enable')
          .sort((a, b) => (a.Rank ?? 0) - (b.Rank ?? 0));
        setReports(enabled);
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: axios.isAxiosError(error)
            ? error.response?.data?.message || error.message
            : 'Failed to load reports',
          color: 'red',
        });
      } finally {
        setLoadingReports(false);
      }
    };
    loadReports();
  }, []);

  const loadDetails = async (id: string): Promise<void> => {
    try {
      setLoadingDetails(true);
      const response = await axios.get<ReportDetail[]>(
        `${API_BASE}/psb/reports/${id}/details`
      );
      setDetails(response.data || []);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Failed to load report files',
        color: 'red',
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleReportChange = (value: string | null): void => {
    setReportId(value);
    setDetails([]);
    if (value) {
      loadDetails(value);
    }
  };

  const deleteDetail = async (detail: ReportDetail): Promise<void> => {
    try {
      await axios.post(
        `${API_BASE}/psb/reportdetails/${detail.ArchiveID}/delete`
      );
      notifications.show({
        title: 'Success',
        message: 'The file has been deleted.',
        color: 'green',
      });
      setDetails((prev) =>
        prev.filter((d) => d.ArchiveID !== detail.ArchiveID)
      );
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Failed to delete file',
        color: 'red',
      });
    }
  };

  const confirmDelete = (detail: ReportDetail): void => {
    modals.openConfirmModal({
      title: 'Delete file',
      children: (
        <Text size="sm">
          Are you sure you want to delete this file? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteDetail(detail),
    });
  };

  const reportOptions = reports.map((r) => ({
    value: String(r.ReportID),
    label: r.ReportName ?? `Report ${r.ReportID}`,
  }));

  const formatDate = (date: string | null): string =>
    date ? dayjs(date).format('DD/MM/YYYY') : '-';

  const downloadUrl = (detail: ReportDetail): string =>
    `${API_BASE}/psb/reportdetails/${detail.ArchiveID}/download`;

  const fileName = (detail: ReportDetail): string =>
    (detail.FileLocation ?? '').split('/').pop() ?? '';

  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Box style={{ position: 'relative' }}>
          <LoadingOverlay visible={loadingReports} />
          <Stack gap="md">
            <Title order={3} ta="center">
              Delete File
            </Title>

            {!loadingReports && reports.length === 0 ? (
              <Text ta="center" c="dimmed">
                Please add the Report Title first.
              </Text>
            ) : (
              <Select
                label="Report"
                placeholder="Select a report"
                data={reportOptions}
                value={reportId}
                onChange={handleReportChange}
                searchable
              />
            )}

            {reportId && (
              <Box style={{ position: 'relative', minHeight: 80 }}>
                <LoadingOverlay visible={loadingDetails} />
                <Table striped highlightOnHover withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Report Date</Table.Th>
                      <Table.Th>File</Table.Th>
                      <Table.Th style={{ width: 80, textAlign: 'center' }}>
                        Action
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {details.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={3} style={{ textAlign: 'center' }}>
                          <Text c="dimmed" py="sm">
                            No files found for this report.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      details.map((detail) => (
                        <Table.Tr key={detail.ArchiveID}>
                          <Table.Td style={{ whiteSpace: 'nowrap' }}>
                            {formatDate(detail.ReportDate)}
                          </Table.Td>
                          <Table.Td style={{ wordBreak: 'break-all' }}>
                            {detail.FileLocation ? (
                              <Anchor
                                href={downloadUrl(detail)}
                                download={fileName(detail)}
                              >
                                {fileName(detail)}
                              </Anchor>
                            ) : (
                              '-'
                            )}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'center' }}>
                            <Group justify="center" gap={4} wrap="nowrap">
                              <ActionIcon
                                component="a"
                                href={downloadUrl(detail)}
                                download={fileName(detail)}
                                color="blue"
                                variant="subtle"
                                aria-label="Download file"
                              >
                                <IconDownload size={18} />
                              </ActionIcon>
                              <ActionIcon
                                color="red"
                                variant="subtle"
                                onClick={() => confirmDelete(detail)}
                                aria-label="Delete file"
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
              </Box>
            )}
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
