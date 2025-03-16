import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES } from '../types';

interface FilterBarProps {
  categoryFilter: string | null;
  statusFilter: string | null;
  onFilterChange: (type: 'category' | 'status', value: string | null) => void;
}

export function FilterBar({ categoryFilter, statusFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-col xs:flex-row gap-2">
      <Select
        value={categoryFilter ?? 'all'}
        onValueChange={(value) => onFilterChange('category', value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-full xs:w-[130px] sm:w-[150px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORIES.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={statusFilter ?? 'all'}
        onValueChange={(value) => onFilterChange('status', value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-full xs:w-[130px] sm:w-[150px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
