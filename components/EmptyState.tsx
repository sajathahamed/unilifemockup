"use client";

import React from 'react';
import { FileQuestion, Search, ShoppingBag, Calendar, Users } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        {icon || <FileQuestion className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function NoSearchResults() {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8 text-gray-400" />}
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for."
    />
  );
}

export function NoItems({ itemType = "items" }: { itemType?: string }) {
  return (
    <EmptyState
      icon={<ShoppingBag className="w-8 h-8 text-gray-400" />}
      title={`No ${itemType} yet`}
      description={`There are no ${itemType} to display at the moment.`}
    />
  );
}
