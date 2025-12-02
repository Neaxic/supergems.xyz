import {
  Avatar,
  Button,
  Dialog,
  Text,
  Group,
  TextInput,
  Title,
  UnstyledButton,
  useMantineTheme,
  Indicator,
  Tooltip,
} from "@mantine/core";
import useWindowDimensions from "../hooks/windowHelper";
import { useEffect, useRef, useState } from "react";
import { IconMessage, IconSend, IconUser } from "@tabler/icons";
import { useServerContext } from "../contexts/serverContext";
import { useChatContext } from "../contexts/chatContext";
import { useUserContext } from "../contexts/userContext";
import { getHotkeyHandler } from "@mantine/hooks";

interface ChatHoverProps {}

export const ChatHover = ({ ...props }: ChatHoverProps) => {
  const { usersConnected, users, isConnected } = useServerContext();
  const { chats, sendMessage } = useChatContext();
  const { address } = useUserContext();
  const { width } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isClickBoard, setIsClickBoard] = useState<boolean>(false);
  const theme = useMantineTheme();

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const chatContainer = chatContainerRef.current;
  if (chatContainer && isOpen) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}, [chats, isOpen]);

  // const scrollToBottom = () => {
  //   chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [chats]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     scrollToBottom();
  //   }, 1000);
  // }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [isOpen]);

  const handleCopyClickboard = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setIsClickBoard(true);
    setTimeout(() => {
      setIsClickBoard(false);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!message) return;
    if (message.length > 5 && message.length < 285) {
      sendMessage(message);
      setMessage("");
    }
  };

  if (!address) return null;
  else
    return (
      <>
        <div style={{ position: "fixed", bottom: 45, left: 45, zIndex: 9999 }}>
          {!isOpen ? (
            <UnstyledButton onClick={() => setIsOpen(!isOpen)}>
              <div
                style={{
                  padding: "5px",
                  display: "flex",
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? "rgb(15, 15, 15)"
                      : "#EDEDED",
                  borderRadius: "32px",
                }}
              >
                <Avatar radius="xl" size="lg" color="primary">
                  <IconMessage></IconMessage>
                </Avatar>
                {width > 800 && (
                  <div
                    style={{
                      placeContent: "center",
                      display: "flex",
                      flexDirection: "column",
                      marginLeft: "32px",
                      paddingRight: "22px",
                    }}
                  >
                    <Title
                      style={{
                        fontFamily: "Carbon Blood, monospace",
                        fontWeight: 300,
                      }}
                      size={14}
                    >
                      CHATROOM #1
                    </Title>
                    <Title
                      style={{
                        fontFamily: "Carbon Blood, monospace",
                        fontWeight: 300,
                      }}
                      color="#5a5d5a"
                      size={14}
                    >
                      Click to open
                    </Title>
                  </div>
                )}
              </div>
            </UnstyledButton>
          ) : (
            <>
              <div style={{ width: "300px", height: "40%" }}>
                <Dialog
                  opened={isOpen}
                  withCloseButton
                  onClose={() => setIsOpen(!isOpen)}
                  size="lg"
                  radius="md"
                  position={{ left: 45, bottom: 45 }}
                  style={{
                    height: "600px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignContent: "center",
                      paddingLeft: "5px",
                    }}
                  >
                    {isConnected ? (
                      <Indicator
                        color="green"
                        position="middle-center"
                        size={14}
                        offset={0}
                        withBorder
                        processing
                        style={{ marginRight: "20px" }}
                      >
                        <span />
                      </Indicator>
                    ) : (
                      <Indicator
                        color="red"
                        position="middle-center"
                        size={14}
                        offset={0}
                        withBorder
                        processing
                        style={{ marginRight: "20px" }}
                      >
                        <span />
                      </Indicator>
                    )}
                    <div style={{ display: "flex", gap: "15px" }}>
                      <Text size="sm" weight={500}>
                        {`${"CHATROOM #1"}`}
                      </Text>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <IconUser size={"14"}></IconUser>
                        <Text size="sm" weight={500} pl={4}>
                          {usersConnected}
                        </Text>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      overflowY: "auto",
                      height: "490px",
                    }}
                  >
                    {chats &&
                      chats.map((msg) => (
                        <div
                          key={msg.createdAt}
                          style={{
                            display: "flex",
                            paddingLeft: "5px",
                            paddingTop: "5px",
                            paddingBottom: "5px",
                          }}
                        >
                          <div>
                            <Tooltip
                              onClick={() => handleCopyClickboard(msg.uid)}
                              label={isClickBoard ? "Copied!" : `${msg.uid}`}
                              style={{
                                backgroundColor: isClickBoard
                                  ? "#2f9e44"
                                  : undefined,
                                transition: "background-color 2s ease-out",
                              }}
                            >
                              <div>
                                {users.filter((e) => e.address === msg.uid).length > 0 ? (
                                  <Indicator
                                    inline
                                    size={16}
                                    offset={4}
                                    position="top-start"
                                    color="green"
                                    withBorder
                                  >
                                    <Avatar
                                      radius="xl"
                                      onClick={() =>
                                        navigator.clipboard.writeText(msg.uid)
                                      }
                                      size="md"
                                      color="dark"
                                      style={{
                                        marginRight: "10px",
                                        cursor: "pointer",
                                      }}
                                      src={msg.pfp}
                                    />
                                  </Indicator>
                                ) : (
                                  <Indicator
                                    inline
                                    size={16}
                                    offset={4}
                                    position="top-start"
                                    color="gray"
                                    withBorder
                                  >
                                    <Avatar
                                      radius="xl"
                                      size="md"
                                      color="dark"
                                      style={{ marginRight: "10px" }}
                                      src={msg.pfp}
                                    />
                                  </Indicator>
                                )}
                              </div>
                            </Tooltip>
                          </div>
                          <div
                            style={{ width: "100%", overflowWrap: "anywhere" }}
                          >
                            <Text color="gray" size={"xs"}>
                              {msg.createdAt}
                            </Text>
                            <Text>{msg.text}</Text>
                          </div>
                        </div>
                      ))}
                    <div ref={chatContainerRef} />
                  </div>

                  <div>
                    <Group align="flex-end">
                      <TextInput
                        value={message}
                        placeholder="Send a message"
                        sx={{ flex: 1 }}
                        onChange={(event) =>
                          setMessage(event.currentTarget.value)
                        }
                        onKeyDown={getHotkeyHandler([
                          ["Enter", handleSendMessage],
                        ])}
                      />
                      <Button onClick={() => handleSendMessage()}>
                        <IconSend></IconSend>
                      </Button>
                    </Group>
                  </div>
                </Dialog>
              </div>
            </>
          )}
        </div>
      </>
    );
};
