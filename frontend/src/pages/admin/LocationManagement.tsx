import React, { useEffect, useState } from 'react';
import { getLocations } from '../../api/locations';
import { Location } from '../../types';
import PageHeader from '../../components/PageHeader';
import DataTable, { Column } from '../../components/DataTable';

const LocationManagement = () => {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    getLocations().then(res => setLocations(res.items)).catch(console.error);
  }, []);

  const cols: Column<Location>[] = [
    { header: 'Name', accessor: 'name' },
    { header: 'Building Type', accessor: 'building_type' },
    { header: 'Block', accessor: 'block' },
    { header: 'Room', accessor: 'room' }
  ];

  return (
    <div>
      <PageHeader title="Location Management" />
      <DataTable columns={cols} data={locations} />
    </div>
  );
};

export default LocationManagement;
