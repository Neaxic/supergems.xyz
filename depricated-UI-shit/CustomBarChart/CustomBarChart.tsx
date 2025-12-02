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

    ".highcharts-grid-line": {
      stroke: theme.colorScheme === "dark" ? "#000" : "#fff",
      strokeWidth: 0,
    },

    ".highcharts-credits": {
      display: "none",
    },

    ".highcharts-tick": {
      display: "none",
    },

    ".highcharts-axis-line": {
      display: "none",
    },
  },
}));

interface CustomBarChartProps {
  title?: string;
  data?: any;
  series?: any;
  type?: string;
  style?: React.CSSProperties;
}

export function CustomBarChart({
  title,
  data,
  series,
  type,
  style,
  ...props
}: CustomBarChartProps) {
  const { classes } = useStyles();

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const options: Highcharts.Options = {
    chart: {
        type: 'column'
    },
    title: {
      text: title,
    },
    xAxis: {
      categories: ['21/05/23', '22/05/23', '23/05/23', '24/05/23', '25/05/23', '26/05/23' , '27/05/23', '28/05/23', '29/05/23', '30/05/23' , '31/05/23', '01/06/23', '02/06/23', '03/06/23', '04/06/23', '05/06/23', '06/06/23', '07/06/23', '08/06/23', '09/06/23'],
      crosshair: true,
      accessibility: {
          description: 'Volume'
      }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'USD Traded (in millions)'
        }
    },
    series: series,
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
