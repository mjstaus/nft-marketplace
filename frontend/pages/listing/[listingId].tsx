import {
  useContract,
  useNetwork,
  useNetworkMismatch,
} from "@thirdweb-dev/react";
import { ChainId, ListingType, NATIVE_TOKENS } from "@thirdweb-dev/sdk";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ListingPage = () => {
  const MARKETPLACE_CONTRACT_ADDRESS =
    "0xaF7C92b69446649766D3BCB37C7Ffd2C78e8dA3b";
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  // Next JS Router hook to redirect to other pages and to grab the query
  const router = useRouter();

  // De-construct listingId out of the router.query.
  // This means that if the user visits /listing/0 then the listingId will be 0.
  // If the user visits /listing/1 then the listingId will be 1.
  // We do some weird TypeScript casting, because Next.JS thinks listingId can be an array for some reason.
  const { listingId } = router.query as { listingId: string };

  // Loading flag for the UI, so we can show a loading state while we wait for the data to load.
  const [loadingListing, setLoadingListing] = useState(true);

  // Store the bid amount the user entered into the bidding textbox
  const [bidAmount, setBidAmount] = useState("");

  // Storing this listing in a state variable so we can use it in the UI once it's feched
  const [listing, setListing] = useState<any | undefined>();

  //Initialize the marketplace contract
  const { contract } = useContract(MARKETPLACE_CONTRACT_ADDRESS, "marketplace");

  // When the component mounts, ask the marketplace for the listing with the given listingId
  // Using the listingid from the URL (via router.query)
  useEffect(() => {
    if (!listingId || !contract) {
      return;
    }
    (async () => {
      // Pas the listingId into the getListing function to get the listing with the given listingId
      const l = await contract.getListing(listingId);

      // Update state accordingly
      setLoadingListing(false);
      setListing(l);
      console.log("listing:", l);
      
    })();
  }, [listingId, contract]);

  if (loadingListing) {
    return <div>Loading...</div>;
  }

  if (!listing) {
    return <div> Listing not found</div>;
  }

  async function createBidOrOffer() {
    try {
      // Ensure user is on the correct network
      if (networkMismatch) {
        switchNetwork && switchNetwork(80001);
        return;
      }
      // If the listing type is a direct listing, then we can create an offer
      if (listing?.type === ListingType.Direct) {
        await contract?.direct.makeOffer(
          listingId,
          1, // Quantity
          NATIVE_TOKENS[ChainId.Mumbai].wrapped.address,
          bidAmount
        );
      }
      // If the listing type is an auction listing, then we can create a bid
      if (listing?.type === ListingType.Auction) {
        await contract?.auction.makeBid(listingId, bidAmount);
      }
      alert(
        `${
          listing?.type === ListingType.Auction ? "Bid" : "Offer"
        } created successfully!`
      );
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  async function buyNft() {
    try {
      // Ensure user is on the correct network
      // if (networkMismatch) {
      //   switchNetwork && switchNetwork(80001);
      //   return;
      // }
      // Simple one-liner for buying the NFT
      await contract?.buyoutListing(listingId, 1);
      alert("NFT bought successfully!");
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  return (
    <div>
      <img src={listing.asset.image} />
      <h1>{listing.asset.name}</h1>
      <p>
        <strong>Description:</strong> {listing.asset.description}
      </p>
      <p>
        <strong>Seller:</strong> {listing.sellerAddress}
      </p>
      <p>
        <strong>Listing Type:</strong>{" "}
        {listing.type === 0 ? "Direct Listing" : "Auction  Listing"}
      </p>
      <p>
        <strong>Buyout Price</strong>{" "}
        {listing.buyoutCurrencyValuePerToken.displayValue}{" "}
        {listing.buyoutCurrencyValuePerToken.symbol}
      </p>
      <div>
        <div>
          <button onClick={buyNft}>Buy Now</button>
          <div>
            <input
              type="text"
              name="bidAmount"
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Amount"
            />
          </div>
          <button onClick={createBidOrOffer}>Make Offer</button>
        </div>
      </div>
    </div>
  );
};

export default ListingPage;
