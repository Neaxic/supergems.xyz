import {
  Button,
  Dialog,
  Text,
  UnstyledButton,
  Input,
  Flex,
} from "@mantine/core";
import useWindowDimensions from "../hooks/windowHelper";
import { useEffect, useRef, useState } from "react";
import { IconSend } from "@tabler/icons";
import { useUserContext } from "../contexts/userContext";
import { usePrepareSendTransaction, useSendTransaction } from "wagmi";
import useDebounce from "../hooks/UseDebounce";
import { parseEther } from "ethers/lib/utils";

interface DonationHoverProps { }

export const DonationHover = ({ ...props }: DonationHoverProps) => {
  const { address } = useUserContext();
  const { width } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);

  const [amount, setAmount] = useState('')
  const [debouncedAmount] = useDebounce(amount, 500)

  const { config } = usePrepareSendTransaction({
    to: "0x3c15B98DC366131877fCE2fB0592A7A20059401b",
    value: debouncedAmount ? BigInt(parseEther(debouncedAmount).toString()) : undefined,
  })
  const { sendTransaction } = useSendTransaction(config)


  if (!address) return null;
  else
    return (
      <>
        <div style={{ position: "fixed", bottom: 45, left: 45, zIndex: 100 }}>
          {!isOpen ? (
            <UnstyledButton onClick={() => setIsOpen(!isOpen)}>
              <div
                style={{
                  padding: "5px",
                }}
              >
                <Text
                  fw={"bold"}
                  ff={"Golos Text Regular, monospace"}
                  align="center"
                  size={width > 600 ? "sm" : "xs"}
                  style={{ paddingRight: "5%", paddingLeft: "5%" }}
                >
                  SUPPORT THE PROJECT
                </Text>
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
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <>
                    <Text
                      fw={"bold"}
                      ff={"Golos Text Regular, monospace"}
                      align="center"
                      size={width > 600 ? "md" : "sm"}
                      style={{ paddingRight: "5%", paddingLeft: "5%" }}
                    >
                      SUPPORT THE PROJECT
                    </Text>
                    <Text
                      fw={"bold"}
                      ff={"Golos Text Regular, monospace"}
                      align="left"
                      size={width > 600 ? "sm" : "xs"}
                      mt={8}
                      style={{ paddingRight: "5%", paddingLeft: "5%" }}
                    >
                      Support Andre's work by making a contribution. <br />
                      Your contribution will help me to continue this work on Supergems, and support the infrastructure built around it. Its not free, even though i provide it for free.

                      <br /><br />
                      <Text>
                        Every contribution, big or small will make a huge diffrence to this small project.
                        Anything & everything is deeply appreciated. 🫡
                      </Text>
                      <br />
                      <br />
                      <Flex>
                        {/* crash on letters */}
                        <Input style={{ width: "100%" }} onChange={(e) => setAmount(e.target.value)} placeholder="0.25"></Input>
                        <Button ml={4} w={"auto"} disabled={!amount} onClick={() => sendTransaction?.()}>
                          <IconSend />
                        </Button>
                      </Flex>
                      <Text mt={8} size={"xs"}>
                        Or send a eth contribution to "Supergems.eth"
                      </Text>
                    </Text>
                    {/* */}
                  </>
                </Dialog>
              </div>
            </>
          )}
        </div>
      </>
    );
};
