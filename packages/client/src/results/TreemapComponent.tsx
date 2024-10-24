import { Treemap } from '@arviva/core';
import { ResponsiveTreeMap } from '@nivo/treemap';
import {
  SeedsTooltipComponent,
  SeedsTooltipRow,
} from './SeedsTooltipComponent';

const CustomTooltip = (props: any) => {
  const data = props.node.data;
  return (
    <SeedsTooltipComponent>
      <SeedsTooltipRow
        color={data.color}
        category={data.name}
        value={data.loc}
        unit={data.unit}
      />
    </SeedsTooltipComponent>
  );
};

const TreemapComponent = ({ result }: { result: Treemap }) => {
  const myColor = (node: any) => {
    return node.data.color;
  };
  if (!result?.data) {
    return null;
  }
  return (
    <ResponsiveTreeMap
      data={result?.data}
      identity="name"
      value="loc"
      valueFormat=".02s"
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      enableLabel={false}
      labelSkipSize={12}
      labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
      parentLabelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
      leavesOnly={true}
      innerPadding={5}
      borderWidth={0}
      tooltip={CustomTooltip}
      colors={myColor}
      nodeOpacity={1}
    />
  );
};

export default TreemapComponent;
