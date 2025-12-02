import {
  Flex,
  Text,
  Dialog,
  Group,
  TextInput,
  Button,
  Tooltip,
  Box,
  Switch,
  Loader,
  UnstyledButton,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { addEmail, initUser } from "../util/helpers/RoleHelpers";
import DiamondRender from "../components/Three/Diamond/DiamondRender";
import { OldHackText } from "../components/texts/oldHackText/oldHackText";
import useWindowDimensions from "../hooks/windowHelper";
import { useCookies } from "react-cookie";
import { Footer } from "../components/Footers/Footer";

export interface AccessControlProps {
  onChange: (value: boolean) => void;
  db: any;
}

export const AccessControl = ({ onChange, db }: AccessControlProps) => {
  const { address } = useAccount();
  const { width } = useWindowDimensions();
  const [isSmall, setIsSmall] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const [requestResponse, setRequestResponse] = useState<boolean>(false);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [emailAddress, setEmailAddress] = useState<string>("");

  const [cookies, setCookie] = useCookies(["r3qst3d"]);

  const submitMail = async () => {
    if (
      emailAddress !== "" &&
      emailAddress.includes("@") &&
      emailAddress.includes(".") &&
      emailAddress.length > 5
    ) {
      setDialogOpen(false);
      await addEmail(db, address, emailAddress);
    } else {
      alert("Invalid email");
    }
  };

  const requestAccess = async () => {
    setLoader(true);
    setDialogOpen(true);
    await initUser(db, address);
    setCookie("r3qst3d", "true", { path: "/" });
    setLoader(false);

    setRequestResponse(true);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const texts = ["SUPERGEMS", "PR3SS-ME"];

  useEffect(() => {
    let timeoutId: any;

    if (isLoading) {
      // If it's loading, wait for 1 second then set it to not loading
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } else {
      // If it's not loading, wait for 2 seconds then set it to loading and show the next text
      timeoutId = setTimeout(() => {
        setIsLoading(true);
        setTextIndex((textIndex + 1) % texts.length);
      }, 2500);
    }

    // Clean up function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading, textIndex, texts.length]);

  useEffect(() => {
    setIsSmall(width < 768);
  }, [width]);

  return (
    <div style={{ overflow: "hidden", height: "100vh" }}>
      <div style={{ display: "flex", overflow: "hidden" }}>
        {!isSmall && (
          <div style={{ width: "100%", overflow: "hidden" }}>
            <DiamondRender />
          </div>
        )}
        <div style={{ width: "100%", overflow: "hidden" }}>
          <Flex
            direction={"column"}
            justify={"space-between"}
            align={"center"}
            style={{ height: "100vh", width: "100%" }}
          >
            <Flex
              direction="column"
              gap={8}
              justify={"center"}
              style={{ textAlign: "center", height: "inherit" }}
            >
              {loader ? (
                <Loader />
              ) : (
                <>
                  {/* Rotate text 90 deg */}

                  <ConnectButton.Custom>
                    {({
                      account,
                      chain,
                      openAccountModal,
                      openConnectModal,
                      authenticationStatus,
                      mounted,
                    }) => {
                      const ready =
                        mounted && authenticationStatus !== "loading";
                      const connected =
                        ready &&
                        account &&
                        chain &&
                        (!authenticationStatus ||
                          authenticationStatus === "authenticated");

                      if (!ready) return;

                      return (
                        <>
                          <div
                            style={{
                              transform: "rotate(90deg)",
                              display: "flex",
                              justifyContent: "center",
                              alignContent: "center",
                            }}
                          >
                            <UnstyledButton
                              onClick={() =>
                                connected
                                  ? openAccountModal()
                                  : openConnectModal()
                              }
                              style={{ cursor: "pointer" }}
                            >
                              <OldHackText
                                disableHoverAnimation
                                disableInstantAnimation
                                loading={isLoading}
                                uppercase={false}
                                text={texts[textIndex]}
                                style={{ fontSize: 128 }}
                                textProps={{
                                  style: {
                                    fontFamily: "Carbon Blood, monospace",
                                    textDecoration: "none",
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    fontSize: 128,
                                    whiteSpace: "nowrap",
                                  },
                                }}
                              />
                            </UnstyledButton>
                          </div>
                        </>
                      );
                    }}
                  </ConnectButton.Custom>
                </>
              )}
            </Flex>

            {address && (
              <>
                {cookies.r3qst3d ? (
                  <Text
                    size={18}
                    color="#5a5d5a"
                    style={{
                      fontFamily: "Carbon Blood, monospace",
                    }}
                  >
                    Already requested anon.
                  </Text>
                ) : (
                  <Flex gap={"xl"} justify={"center"} align={"center"}>
                    <Flex direction={"column"}>
                      <Text
                        size={18}
                        color="#5a5d5a"
                        style={{
                          fontFamily: "Carbon Blood, monospace",
                        }}
                      >
                        You dont have access.
                      </Text>
                      <Text
                        size={18}
                        color="#5a5d5a"
                        style={{
                          fontFamily: "Carbon Blood, monospace",
                        }}
                      >
                        Request early whitelist.
                      </Text>
                    </Flex>

                    <Tooltip label="Want?">
                      <Box>
                        <Switch
                          size="md"
                          checked={requestResponse}
                          onChange={() => requestAccess()}
                        />
                      </Box>
                    </Tooltip>
                  </Flex>
                )}
              </>
            )}
            <Footer fullWidth={false} />
          </Flex>
        </div>
      </div>

      <Dialog
        opened={dialogOpen}
        withCloseButton
        onClose={() => setDialogOpen(false)}
        size="lg"
        radius="md"
      >
        <Text size="sm" weight={500}>
          Want to be notified on benefits?
        </Text>

        <Group align="flex-end">
          <TextInput
            security="asd"
            onChange={(text) => setEmailAddress(text.currentTarget.value)}
            value={emailAddress}
            placeholder="gavin@piedpiper.com"
            style={{ flex: 1 }}
          />
          <Button onClick={() => submitMail()}>Yes</Button>
        </Group>
      </Dialog>

      {!isSmall && (
        <div
          style={{
            transform: "rotate(90deg)",
            whiteSpace: "nowrap",
            textOverflow: "clip",
            marginTop: "-100%",
          }}
        >
          <OldHackText
            uppercase={false}
            text={
              "supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems • supergems"
            }
            textProps={{
              style: {
                fontFamily: "Carbon Blood, monospace",
                textDecoration: "none",
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: 24,
              },
            }}
          />
        </div>
      )}
    </div>
  );
};
