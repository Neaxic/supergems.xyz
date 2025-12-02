import { createStyles } from "@mantine/core";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useRef } from "react";

const useStyles = createStyles((theme) => ({
  wrapper: {
    backgroundColor: "black",
    width: "100%",

    ".highcharts-background": {
      fill: theme.colorScheme === "dark" ? "#000" : "#fff",
    },

    ".highcharts-point": {
      strokeWidth: 1,
    },
  },
}));

const colors = [
  "#695ada",
  "#0fe679",
  "#cf0fe6",
  "#FF8D6C",
  "#FFC558",
  "#FF5E94",
  "#A891FF",
  "#009876",
  "#000572",
]

interface CustomPieChartProps {
  title?: string;
  data?: any;
  series?: any;
  drilldown?: any;
  type?: string;
  style?: React.CSSProperties;
}

export function CustomPieChart({
  title,
  data,
  series,
  drilldown,
  type,
  style,
  ...props
}: CustomPieChartProps) {
  const { classes } = useStyles();

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const options: Highcharts.Options = {
    title: {
      text: title,
    },
    chart: {
      plotShadow: false,
      type: "pie",
    },
    colors: colors,
    series: series,
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: false,
          format: "{point.name}: {point.y:.1f}%",
        },
      },
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: false,
        },
        showInLegend: true,
      },
    },

    drilldown: drilldown,
  };

  return (
    <div className={classes.wrapper}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartComponentRef}
        {...props}
      />
    </div>
  );
}
