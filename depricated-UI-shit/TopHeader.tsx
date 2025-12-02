import { useState } from "react";
import {
  createStyles,
  Header,
  Group,
  ActionIcon,
  Container,
  Drawer,
  ScrollArea,
  UnstyledButton,
  Divider,
  Burger,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLink,
  IconUser,
  IconLogin,
  TablerIcon,
  IconHome,
} from "@tabler/icons";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ThemeColorSelector } from "../ThemeColorSelector";
import { useAccount } from "wagmi";
// import headerBG from "../../assets/headerBG.png";

const useStyles = createStyles((theme) => ({
  inner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,

    [theme.fn.smallerThan("sm")]: {
      justifyContent: "flex-start",
    },
  },

  unStyledBotton: {
    alignContent: "center",
  },

  hiddenDesktop: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  links: {
    width: 260,

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  social: {
    width: 260,

    [theme.fn.smallerThan("sm")]: {
      width: "auto",
      marginLeft: "auto",
    },
  },

  burger: {
    marginRight: theme.spacing.md,

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

interface topHeaderProps {
  links: {
    icon?: TablerIcon;
    path: string;
    label: string;
    restricted?: boolean;
  }[];
}

export default function TopHeader({ links }: topHeaderProps) {
  const [active, setActive] = useState(links[0].path);
  const { classes, cx, theme } = useStyles();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const { address } = useAccount();

  const items = links.map((link) => {
    if (link.restricted && address) {
      return (
        <Link to={link.path} key={link.label}>
          <UnstyledButton
            onClick={() => {
              setActive(link.path);
            }}
            className={cx(classes.link, {
              [classes.linkActive]: active === link.path,
            })}
          >
            <span style={{ textDecoration: "none" }}>{link.label}</span>
          </UnstyledButton>
        </Link>
      );
    } else {
      return (
        <>
          <span>LOCKED</span>
        </>
      );
    }
  });

  return (
    <>
      <Header style={{ position: "fixed" }} height={56}>
        <Container className={classes.inner}>
          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            size="sm"
            className={classes.burger}
          />
          <Group className={classes.links} spacing={5}>
            {items}
          </Group>

          <Link to="/">
            <Text
              variant="gradient"
              gradient={{ from: theme.primaryColor, to: "orange", deg: 45 }}
              weight="900"
              style={{
                textDecoration: "none",
                color: theme.primaryColor,
              }}
            >
              TOKENLOUNGE.XYZ
            </Text>
          </Link>

          <Group spacing={0} className={classes.social} position="right" noWrap>
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== "loading";
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === "authenticated");

                if (!connected) {
                  return (
                    <ActionIcon size="lg" style={{ marginRight: 16 }}>
                      <div
                        className={cx(classes.link)}
                        onClick={openConnectModal}
                      >
                        <IconLogin></IconLogin>
                      </div>
                    </ActionIcon>
                  );
                }

                return (
                  <>
                    <ActionIcon size="lg" style={{ marginRight: 16 }}>
                      <div
                        className={cx(classes.link)}
                        onClick={openChainModal}
                      >
                        <IconLink></IconLink>
                      </div>
                    </ActionIcon>
                    <ActionIcon size="lg" style={{ marginRight: 16 }}>
                      <div
                        className={cx(classes.link)}
                        onClick={openAccountModal}
                      >
                        <IconUser></IconUser>
                      </div>
                    </ActionIcon>
                  </>
                );
              }}
            </ConnectButton.Custom>
            <ActionIcon size="lg">
              <ThemeColorSelector></ThemeColorSelector>
            </ActionIcon>
          </Group>
        </Container>
      </Header>
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title={
          <UnstyledButton style={{ display: "flex" }}>
            <Link to="/">
              <IconHome></IconHome>
              <Text>yo</Text>
            </Link>
          </UnstyledButton>
        }
        className={classes.hiddenDesktop}
        zIndex={1000000}
      >
        <ScrollArea sx={{ height: "calc(100vh - 60px)" }} mx="-md">
          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />
          {items}
          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />
        </ScrollArea>
      </Drawer>
    </>
  );
}
