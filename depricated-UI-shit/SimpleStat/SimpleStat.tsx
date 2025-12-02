import { createStyles, Flex, Group, Text } from "@mantine/core";
import { IconArrowUpRight, IconArrowDownRight } from "@tabler/icons";

const useStyles = createStyles((theme) => ({
  value: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
  },

  diff: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },
}));

interface StatsGridProps {
  data: {
    title: string;
    value: string;
    diff: number;
    suffix?: string;
  }[];
  style?: React.CSSProperties;
  direction?: "row" | "column";
  gap?: number;
}

export function SimpleStat({
  data,
  style,
  gap = 12,
  direction = "row",
  ...props
}: StatsGridProps) {
  const { classes } = useStyles();

  return (
    <>
      {data.map((stat) => {
        const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;
        return (
          <Flex key={stat.title} direction={"column"}>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text className={classes.value}>
                {stat.value} {stat.suffix ? stat.suffix : "$"}
              </Text>
              <Text
                color={stat.diff > 0 ? "teal" : "red"}
                size="sm"
                weight={500}
                className={classes.diff}
              >
                <span>{stat.diff}%</span>

                <DiffIcon size={16} stroke={1.5} />
              </Text>
            </Group>
            <Text size="xs" color="dimmed" mt={7}>
              {stat.title}
            </Text>
          </Flex>
        );
      })}
    </>
  );
}
