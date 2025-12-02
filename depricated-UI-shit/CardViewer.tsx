import { Text, Grid } from "@mantine/core";
import { INewNFT } from "../util/types";
import { CardElement } from "./CardElement";

interface CardViewerProps {
  items?: INewNFT[];
  label?: string;
  selectedItems?: INewNFT[];
  setSelectedItems?: React.Dispatch<React.SetStateAction<INewNFT[]>>;
  span?: number;
}

export const CardViewer = ({
  items,
  selectedItems,
  setSelectedItems,
  label,
  span = 3,
  ...props
}: CardViewerProps) => {
  return (
    <>
      <Text>{label}</Text>
      {items ? (
        <>
          <Grid gutter="sm">
            {items.map((value) => (
              <Grid.Col
                onClick={() => {
                  if (setSelectedItems && selectedItems) {
                    setSelectedItems([...selectedItems, value]);
                  }

                  let index = items.indexOf(value);
                  if (index !== -1) {
                    items.splice(index, 1);
                  }
                }}
                span={span}
                key={value.id}
              >
                <CardElement item={value}></CardElement>
              </Grid.Col>
            ))}
          </Grid>
        </>
      ) : (
        <p>No NFT found in wallet</p>
      )}
    </>
  );
};
