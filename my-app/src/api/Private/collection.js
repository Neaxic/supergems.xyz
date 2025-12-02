export const getCollectionByName = async (keyword) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/collection/name/${keyword}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};
