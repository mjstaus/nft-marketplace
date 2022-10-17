import {
  useContract,
  useNetwork,
  useNetworkMismatch,
} from "@thirdweb-dev/react";
import { NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import { useRouter } from "next/router";

const Create = () => {

  const MARKETPLACE_CONTRACT_ADDRESS = "0xaF7C92b69446649766D3BCB37C7Ffd2C78e8dA3b";
  const NETWORK_ID = 80001; //Polygon Mumbai
  // Next JS Router hook to redirect to other pages
  const router = useRouter();

  //Connect to our marketplace contract via the useMarketplace hook
  const { contract } = useContract(MARKETPLACE_CONTRACT_ADDRESS, "marketplace");
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  // This function gets called when the form is submitted.
// The user has provided:
// - contract address
// - token id
// - type of listing (either auction or direct)
// - price of the NFT
// This function gets called when the form is submitted.
async function handleCreateListing(e: any) {
  try {
    // Ensure user is on the correct network
    if (networkMismatch) {
      switchNetwork && switchNetwork(NETWORK_ID);
      return;
    }

    // Prevent page from refreshing
    e.preventDefault();

    // Store the result of either the direct listing creation or the auction listing creation
    let transactionResult = undefined;

    // De-construct data from form submission
    const { listingType, contractAddress, tokenId, price } = e.target.elements;

    // Depending on the type of listing selected, call the appropriate function
    // For Direct Listings:
    if (listingType.value === "directListing") {
      transactionResult = await createDirectListing(
        contractAddress.value,
        tokenId.value,
        price.value,
      );
    }

    // For Auction Listings:
    if (listingType.value === "auctionListing") {
      transactionResult = await createAuctionListing(
        contractAddress.value,
        tokenId.value,
        price.value,
      );
    }

    // If the transaction succeeds, take the user back to the homepage to view their listing!
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
    price: string,
  ) {
    try {
      const transaction = await contract?.direct.createListing({
        assetContractAddress: contractAddress, // Contract Address of the NFT
        buyoutPricePerToken: price, // Maximum price, the auction will end immediately if a user pays this price.
        currencyContractAddress: NATIVE_TOKEN_ADDRESS, // NATIVE_TOKEN_ADDRESS is the crpyto curency that is native to the network. i.e. Goerli ETH.
        listingDurationInSeconds: 60 * 60 * 24 * 7, // When the auction will be closed and no longer accept bids (1 Week)
        quantity: 1, // How many of the NFTs are being listed (useful for ERC 1155 tokens)
        startTimestamp: new Date(), // When the listing will start
        tokenId: tokenId, // Token ID of the NFT.
      });
  
      return transaction;
    } catch (error) {
      console.error(error);
    }
  }

  async function createDirectListing(
    contractAddress: string,
    tokenId: string,
    price: string,
  ) {
    try {
      const transaction = await contract?.direct.createListing({
        assetContractAddress: contractAddress, // Contract Address of the NFT
        buyoutPricePerToken: price, // Maximum price, the auction will end immediately if a user pays this price.
        currencyContractAddress: NATIVE_TOKEN_ADDRESS, // NATIVE_TOKEN_ADDRESS is the crpyto curency that is native to the network. i.e. Goerli ETH.
        listingDurationInSeconds: 60 * 60 * 24 * 7, // When the auction will be closed and no longer accept bids (1 Week)
        quantity: 1, // How many of the NFTs are being listed (useful for ERC 1155 tokens)
        startTimestamp: new Date(0), // When the listing will start
        tokenId: tokenId, // Token ID of the NFT.
      });
  
      return transaction;
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <form onSubmit={(e) => handleCreateListing(e)}>
      <div>
        {/* Form Section */}
        <div>
          <h1>Upload your NFT to the marketplace:</h1>
  
          {/* Toggle between direct listing and auction listing */}
          <div>
            <input
              type="radio"
              name="listingType"
              id="directListing"
              value="directListing"
              defaultChecked
            /> Direct Listing
            <input
              type="radio"
              name="listingType"
              id="auctionListing"
              value="auctionListing"
            /> Auction Listing
          </div>
  
          {/* NFT Contract Address Field */}
          <input
            type="text"
            name="contractAddress"
            placeholder="NFT Contract Address"
          />
  
          {/* NFT Token ID Field */}
          <input type="text" name="tokenId" placeholder="NFT Token ID" />
  
          {/* Sale Price For Listing Field */}
          <input type="text" name="price" placeholder="Sale Price" />
  
          <button type="submit">Create Listing</button>
        </div>
      </div>
    </form>
  );
};

export default Create;
