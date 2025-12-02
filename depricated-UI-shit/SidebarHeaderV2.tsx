import { useState } from "react";
import {
  createStyles,
  Navbar,
  Text,
  UnstyledButton,
  Group,
  Code,
} from "@mantine/core";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import {
  IconSettings,
  IconLogin,
  IconUser,
  TablerIcon,
  IconLink,
  IconArrowsRandom,
  IconArrowsExchange,
  IconGlobe,
  IconHome2,
} from "@tabler/icons";
import { ThemeColorSelector } from "../ThemeColorSelector";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[1]
      }`,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.gray[1]
          : theme.colors.dark[8],
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      width:"100%",
      fontSize: theme.fontSizes.sm,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        color: theme.colorScheme === "dark" ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[2]
          : theme.colors.gray[6],
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.fn.variant({
          variant: "light",
          color: theme.primaryColor,
        }).background,
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color,
        [`& .${icon}`]: {
          color: theme.fn.variant({
            variant: "light",
            color: theme.primaryColor,
          }).color,
        },
      },
    },
  };
});

interface NavbarLinkProps {
  icon: TablerIcon;
  label: string;
  active?: boolean;
  onClick?(): void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  const { classes, cx } = useStyles();
  return (
    <UnstyledButton
      onClick={onClick}
      className={cx(classes.link, { [classes.linkActive]: active })}
    >
      <Icon stroke={1.5} className={classes.linkIcon} />
      <span style={{textDecoration:"none"}}>{label}</span>
    </UnstyledButton>
  );
}

const data = [
  { icon: IconHome2, label: "Home", path: "/" },
  { icon: IconArrowsExchange, label: "Personal offers", path: "trade" },
  { icon: IconGlobe, label: "Global offers", path: "placeholder" },
  { icon: IconArrowsRandom, label: "Inventory", path: "profile" },
  { icon: IconSettings, label: "Settings", path: "Settings" },
];

export default function SidebarHeaderV2() {
  const { classes } = useStyles();
  const [active, setActive] = useState("Billing");

  const links = data.map((item, index) => (
    <Link to={item.path} key={item.label}>
      <NavbarLink
        {...item}
        key={item.label}
        active={item.label === active}
        onClick={() => setActive(item.label)}
      />
    </Link>
  ));

  return (
    <Navbar width={{ sm: 300 }} style={{top:0, position:"sticky"}} p="md">
      <Navbar.Section grow>
        <Group className={classes.header} position="apart">
          <Text
            style={{
              fontWeight: "900",
            }}
          >
            NFTLOUNGE.DEV
          </Text>
          <Code sx={{ fontWeight: 700 }}>v0.0.4</Code>
        </Group>

        {links}
        <ThemeColorSelector fullwidth ></ThemeColorSelector>
      </Navbar.Section>

      <Navbar.Section className={classes.footer}>
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
                <>
                  <NavbarLink
                    onClick={openConnectModal}
                    icon={IconLogin}
                    label="Login"
                  />
                </>
              );
            }

            return (
              <>
                <NavbarLink
                  icon={IconUser}
                  onClick={openAccountModal}
                  label="Account"
                />
                <NavbarLink
                  icon={IconLink}
                  onClick={openChainModal}
                  label="Switch chain"
                />
              </>
            );
          }}
        </ConnectButton.Custom>
      </Navbar.Section>
    </Navbar>
  );
}
