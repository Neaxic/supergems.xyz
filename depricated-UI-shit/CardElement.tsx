import { Text, createStyles, Image } from "@mantine/core";
import { INewNFT } from "../util/types";
import placeholder from "../assets/placeholder.jpg";

export interface CardElementProps {
  item: INewNFT;
}

const useStyles = createStyles((theme) => ({
  div: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[0]
        : theme.colors.dark[9],
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[9]
        : theme.colors.gray[2],
    borderRadius: "10px",
    padding: "5px",
  },
}));

export const CardElement = ({ item, ...props }: CardElementProps) => {
  const { classes, cx } = useStyles();

  return (
    <div className={cx(classes.div)}>
      <Image
        src={item.image_preview_url ? item.image_preview_url : placeholder}
        radius="md"
        style={{ overflow: "hidden", maxWidth: 273, marginBottom: "10px" }}
      ></Image>
      <Text>{item.name ? item.name : "No metadata name"}</Text>
      <Text>#{item.token_id.slice(-5)}</Text>
    </div>
  );
};
