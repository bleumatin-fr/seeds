import { Count, useListContext } from 'react-admin';

import { Divider, Tab, Tabs, Theme, useMediaQuery } from '@mui/material';
import { ReactElement, useCallback } from 'react';

interface TabbedDatagridTab {
  id: string;
  name: string;
  icon: ReactElement;
}

interface TabbedDatagridProps {
  tabs: TabbedDatagridTab[];
  source: string;
  children: ({
    isXSmall,
    filterValues,
  }: {
    isXSmall: boolean;
    filterValues: any;
  }) => JSX.Element;
}

const TabbedDatagrid = ({ source, tabs, children }: TabbedDatagridProps) => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;
  const isXSmall = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down('sm'),
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<{}>, value: any) => {
      setFilters &&
        setFilters(
          { ...filterValues, [source]: value },
          displayedFilters,
          false, // no debounce, we want the filter to fire immediately
        );
    },
    [displayedFilters, filterValues, setFilters, source],
  );

  return (
    <>
      <Tabs
        variant="fullWidth"
        centered
        value={filterValues[source] || tabs[0].id}
        indicatorColor="primary"
        onChange={handleChange}
      >
        {tabs.map((choice) => (
          <Tab
            key={choice.id}
            icon={choice.icon}
            iconPosition='start'
            label={
              <span>
                {choice.name} (
                <Count
                  filter={{
                    ...filterValues,
                    [source]: choice.id,
                  }}
                  sx={{ lineHeight: 'inherit' }}
                />
                )
              </span>
            }
            value={choice.id}
          />
        ))}
      </Tabs>
      <Divider />
      {children({ isXSmall, filterValues })}
    </>
  );
};

export default TabbedDatagrid;
