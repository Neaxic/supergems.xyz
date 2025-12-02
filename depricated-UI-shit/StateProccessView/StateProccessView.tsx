import React, { useState } from "react";
import { Box, Flex, Stepper, createStyles, Text } from "@mantine/core";
import { IconCircle, IconSquare } from "@tabler/icons";

const useStyles = createStyles((theme) => ({
  blurredContent: {

  },
  title: {
    textAlign: "center",
  },
  steppers: {
    '.mantine-Stepper-separator': {
      color: "white",
      fill: "white",
      backgroundColor: "white",
    }
  },
  step: {

    div: {
      borderColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0],
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0],
    },
  }
}));

interface StateProccessViewProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  title?: string;
}

export function StateProccessView({ children, title = "lol", style }: StateProccessViewProps) {
  const [active, setActive] = useState(0);
  const { classes } = useStyles();

  return (
    <Box style={style}>
      <Flex justify={"space-around"}>
        <Box>
          <Text>
            lol
          </Text>
        </Box><Box>
          <Text>
            lol
          </Text>
        </Box><Box>
          <Text>
            lol
          </Text>
        </Box><Box>
          <Text>
            lol
          </Text>
        </Box>
      </Flex>

      <Stepper active={active} className={classes.steppers} onStepClick={setActive}>
        <Stepper.Step className={classes.step} icon={<IconSquare size={18} />} />
        <Stepper.Step className={classes.step} icon={<IconCircle size={18} />} />
        <Stepper.Step className={classes.step} icon={<IconCircle size={18} />} />
        <Stepper.Step className={classes.step} icon={<IconSquare size={18} />} />
      </Stepper>

    </Box >
  );
}