'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  Container,
  FileInput,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconFile, IconUpload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Report } from '@/types/report';

const API_BASE = '/next/api';

export default function UploadReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [reportId, setReportId] = useState<string | null>(null);
  const [reportDate, setReportDate] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const loadReports = async (): Promise<void> => {
      try {
        setLoading(true);
        const url = `${API_BASE}/psb/reports`;
        const response = await axios.get<Report[]>(url);
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
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const handleSubmit = async (): Promise<void> => {
    if (!reportId) {
      notifications.show({ message: 'Please select a report.', color: 'red' });
      return;
    }
    if (!reportDate) {
      notifications.show({ message: 'Please input the Report Date.', color: 'red' });
      return;
    }
    if (!file) {
      notifications.show({ message: 'Please select the upload file.', color: 'red' });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('report', reportId);
      formData.append('reportDate', dayjs(reportDate).format('YYYY-MM-DD'));
      formData.append('uploadFile', file);

      await axios.post(`${API_BASE}/psb/reports/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      notifications.show({
        title: 'Success',
        message: 'The file has been uploaded.',
        color: 'green',
      });

      setReportDate(null);
      setFile(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Failed to upload file',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const reportOptions = reports.map((r) => ({
    value: String(r.ReportID),
    label: r.ReportName ?? `Report ${r.ReportID}`,
  }));

  return (
    <Container size="sm" py="xl">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Box style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          <Stack gap="md">
            <Title order={3} ta="center">
              Upload File
            </Title>

            {!loading && reports.length === 0 ? (
              <Text ta="center" c="dimmed">
                Please add the Report Title first.
              </Text>
            ) : (
              <>
                <Select
                  label="Report"
                  placeholder="Select a report"
                  data={reportOptions}
                  value={reportId}
                  onChange={setReportId}
                  searchable
                  required
                />

                <DatePickerInput
                  label="Report Date"
                  placeholder="DD/MM/YYYY"
                  valueFormat="DD/MM/YYYY"
                  value={reportDate}
                  onChange={setReportDate}
                  leftSection={<IconCalendar size={18} />}
                  required
                />

                <FileInput
                  label="File"
                  placeholder="Select file to upload"
                  value={file}
                  onChange={setFile}
                  leftSection={<IconFile size={18} />}
                  clearable
                  required
                />

                <Group justify="center" mt="md">
                  <Button
                    onClick={handleSubmit}
                    loading={submitting}
                    leftSection={<IconUpload size={18} />}
                    style={{ backgroundColor: '#2665E5' }}
                  >
                    Upload
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
