import { useState } from "react";
import {
  Navbar,
  Center,
  Tooltip,
  UnstyledButton,
  createStyles,
  Stack,
} from "@mantine/core";
import { Link } from "react-router-dom";
import {
  TablerIcon,
  IconHome2,
  IconArrowsRandom,
  IconArrowsExchange,
  IconUser,
  IconLink,
  IconLogin,
  IconBiohazard,
  IconLogout,
} from "@tabler/icons";
import { ThemeColorSelector } from "../ThemeColorSelector";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const useStyles = createStyles((theme) => ({
  link: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },

  active: {
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

interface NavbarLinkProps {
  icon: TablerIcon;
  label: string;
  active?: boolean;
  onClick?(): void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  const { classes, cx } = useStyles();
  return (
    <Tooltip label={label} position="right" transitionDuration={0}>
      <UnstyledButton
        onClick={onClick}
        className={cx(classes.link, { [classes.active]: active })}
      >
        <Icon stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  { icon: IconHome2, label: "Home", path: "/" },
  { icon: IconArrowsExchange, label: "Personal offers", path: "trade" },
  { icon: IconArrowsRandom, label: "Global offers", path: "placeholder" },
  { icon: IconArrowsRandom, label: "Inventory", path: "profile" },
];

export default function Avatar() {
  const [active, setActive] = useState(2);
  const loggedIn = false;

  const links = mockdata.map((link, index) => (
    <Link to={link.path} key={link.label}>
      <NavbarLink
        {...link}
        key={link.label}
        active={index === active}
        onClick={() => setActive(index)}
      />
    </Link>
  ));

  return (
    <Navbar width={{ base: 80 }} style={{ position: "fixed" }} p="md">
      <Center>
        <Link to="/">
          <NavbarLink icon={IconBiohazard} label="LABS"></NavbarLink>
        </Link>
      </Center>

      <Navbar.Section grow>
        <Stack align="center" mt={240} spacing={4}>
          {links}
        </Stack>
      </Navbar.Section>

      <Navbar.Section>
        <Stack align="center" spacing={18}>
          <ThemeColorSelector></ThemeColorSelector>
          {loggedIn ? (
            <div>
              <NavbarLink icon={IconUser} label="Account" />
              <NavbarLink icon={IconLogout} label="Logout" />
            </div>
          ) : (
            <div>
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
            </div>
          )}
        </Stack>
      </Navbar.Section>
    </Navbar>
  );
}
