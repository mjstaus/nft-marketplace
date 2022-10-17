import {
  useCreateAuctionListing,
  useMarketplace,
  useNetwork,
  useNetworkMismatch,
} from "@thirdweb-dev/react";
import { NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import { useRouter } from "next/router";

const CONTRACT_ADDRESS = "0xaF7C92b69446649766D3BCB37C7Ffd2C78e8dA3b";
const NETWORK_ID = 8001; //Polygon Mumbai

const Create = () => {
  // Next JS Router hook to redirect to other pages

  const router = useRouter();

  //Connect to our marketplace contract via the useMarketplace hook
  const marketplace = useMarketplace(CONTRACT_ADDRESS);
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  async function handleCreateListing(e: any) {
    try {
      // Ensure user is on the correct network
      if (networkMismatch) {
        switchNetwork && switchNetwork(NETWORK_ID);
        return;
      }
      // Prevent page from refreshing
      e.preventDefault();

      // Store the result of either the direct listing creation of the auction listing creation
      let transactionResult = undefined;

      // De-construct data from form submission
      const { listingType, contractAddress, tokenId, price } =
        e.target.elements;

      // Depending on the type of listing selected, call the appropriate function
      // For Direct Listings:
      if (listingType.value === "directListing") {
        transactionResult = await createDirectListing(
          contractAddress.value,
          tokenId.value,
          price.value
        );
      }
      // For Auction Listings:
      if (listingType.value === "auctionListing") {
        transactionResult = await createAuctionListing(
          contractAddress.value,
          tokenId.value,
          price.value
        );
      }

      // If the transaction succeeds, take the user bak to the homepage to view their listing
      if (transactionResult) {
        router.push(`/`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function createAuctionListing(
    contractAddress: string,
    tokenId: string,
    price: string
  ) {
    try {
      const transaction = await marketplace?.auction.createListing({
        assetContractAddress: contractAddress, // Contract address of the NFT
        buyoutPricePerToken: price, // Maximum price, the auction will end immediately if a user pays this price
        currencyContractAddress: NATIVE_TOKEN_ADDRESS, // The cryptocurrency that's native to the network - ie. Polygon MTC
        listingDurationInSeconds: 60 * 60 * 24 * 7, //When the auction will be closed and no longer accept bids (1 week)
        quantity: 1, // How many of the NFTs are being listed (useful for ERC 1155 tokens)
        reservePricePerToken: 0, // Minimum price, users cannot bid below this amount
        startTimestamp: new Date(), // When th elisting will start
        tokenId: tokenId, // Token ID of the NFT
      });
      return transaction;
    } catch (error) {
      console.error(error);
    }
  }

  async function createDirectListing(
    contractAddress: string,
    tokenId: string,
    price: string
  ) {
    try {
      const transaction = await marketplace?.direct.createListing({
        assetContractAddress: contractAddress, // Contract address of the NFT
        buyoutPricePerToken: price, // Maximum price, the auction will end immediately if a user pays this pice
        currencyContractAddress: NATIVE_TOKEN_ADDRESS, // The cryptocurrency native to the network
        listingDurationInSeconds: 60 * 60 * 24 * 7, //When the auction will be closed and no longer accept bids (1 week)
        quantity: 1, // How many of the NFTs are being listed (useful for ERC 1155 tokens)
        startTimestamp: new Date(), // When th elisting will start
        tokenId: tokenId, // Token ID of the NFT
      });
      return transaction;
    } catch (error) {
      console.error(error);
    }
  }

  return <div></div>;
};

export default Create;
