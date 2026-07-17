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
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { District } from '@/types/report';

const API_BASE = '/next/api';

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newName, setNewName] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);

  useEffect(() => {
    const loadDistricts = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await axios.get<District[]>(
          `${API_BASE}/psb/districts`
        );
        const enabled = (response.data || [])
          .filter((d) => (d.Status ?? '').toLowerCase() === 'enable')
          .sort((a, b) =>
            (a.DistrictName ?? '').localeCompare(b.DistrictName ?? '')
          );
        setDistricts(enabled);
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: axios.isAxiosError(error)
            ? error.response?.data?.message || error.message
            : 'Failed to load districts',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };
    loadDistricts();
  }, [refresh]);

  const addDistrict = async (): Promise<void> => {
    if (!newName.trim()) {
      notifications.show({
        message: 'Please input the District Name.',
        color: 'red',
      });
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(`${API_BASE}/psb/districts`, { name: newName.trim() });
      notifications.show({
        title: 'Success',
        message: 'The district has been added.',
        color: 'green',
      });
      setNewName('');
      setRefresh((n) => n + 1);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Failed to add district',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteDistrict = async (district: District): Promise<void> => {
    try {
      await axios.post(`${API_BASE}/psb/districts/${district.DistrictID}/delete`);
      notifications.show({
        title: 'Success',
        message: 'The district has been deleted.',
        color: 'green',
      });
      setDistricts((prev) =>
        prev.filter((d) => d.DistrictID !== district.DistrictID)
      );
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Failed to delete district',
        color: 'red',
      });
    }
  };

  const confirmDelete = (district: District): void => {
    modals.openConfirmModal({
      title: 'Delete district',
      children: (
        <Text size="sm">
          Are you sure you want to delete &quot;{district.DistrictName}&quot;?
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteDistrict(district),
    });
  };

  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Box style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          <Stack gap="md">
            <Title order={3} ta="center">
              Add / Delete a District
            </Title>

            <Group align="flex-end" gap="sm">
              <TextInput
                style={{ flex: 1 }}
                label="New District"
                placeholder="Enter district name"
                value={newName}
                maxLength={100}
                onChange={(event) => setNewName(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    addDistrict();
                  }
                }}
              />
              <Button
                onClick={addDistrict}
                loading={submitting}
                leftSection={<IconPlus size={18} />}
                style={{ backgroundColor: '#2665E5' }}
              >
                Add
              </Button>
            </Group>

            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 60 }}>#</Table.Th>
                  <Table.Th>District</Table.Th>
                  <Table.Th style={{ width: 80, textAlign: 'center' }}>
                    Action
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {districts.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={3} style={{ textAlign: 'center' }}>
                      <Text c="dimmed" py="sm">
                        No districts found.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  districts.map((district, idx) => (
                    <Table.Tr key={district.DistrictID}>
                      <Table.Td>{idx + 1}</Table.Td>
                      <Table.Td>{district.DistrictName ?? '-'}</Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Group justify="center" gap={0}>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => confirmDelete(district)}
                            aria-label="Delete district"
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
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
