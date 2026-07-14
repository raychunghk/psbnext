'use client';

import { Group, Button } from '@mantine/core';

interface EventActionsProps {
  onAdd: () => void;
  onDelete: () => void;
}

export const EventActions: React.FC<EventActionsProps> = ({ onAdd, onDelete }) => {
  return (
    <Group gap="md" style={{ marginTop: '20px' }}>
      <Button 
        onClick={onAdd}
        style={{ backgroundColor: '#2665E5' }}
      >
        Add
      </Button>
      <Button 
        onClick={onDelete}
        color="red"
      >
        Delete
      </Button>
    </Group>
  );
};