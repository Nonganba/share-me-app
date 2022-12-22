import React, { useState, useEffect } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { client, urlFor } from "../client";
import MasonryLayout from "./MasonryLayout";
import { similarPinsQuery, pinDetailsQuery } from "../utils/data";
import Spinner from "./Spinner";

const PinDetails = ({ user }) => {
  const [pins, setSimilarPins] = useState(null);
  const [pinDetails, setPinDetails] = useState(null);
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  const { pinId } = useParams();

  const fetchPinDetails = () => {
    let query = pinDetailsQuery(pinId);

    if (query) {
      client.fetch(query).then((data) => {
        setPinDetails(data[0]);

        if (data[0]) {
          query = similarPinsQuery(data[0]);
          client.fetch(query).then((res) => setSimilarPins(res));
        }
      });
    }
  };

  const addComment = () => {
    if (comment) {
      client
        .patch(pinId)
        .setIfMissing({ comments: [] })
        .insert("after", "comments[-1]", [
          {
            comment,
            _key: uuidv4(),
            postedBy: {
              _type: "postedBy",
              _ref: user._id,
            },
          },
        ])
        .commit()
        .then(() => {
          fetchPinDetails(pinId);
          setComment("");
          setAddingComment(false);
        });
    }
  };

  useEffect(() => {
    fetchPinDetails();
  }, [pinId]);

  if (!pinDetails) return <Spinner message="Loading Pin" />;

  return (
    <>
      <div
        className="flex xl:flex-row flex-col m-auto bg-white "
        style={{ maxWidth: "1500px", borderRadius: "32px" }}
      >
        <div className="flex justify-center items-center md:items-start flex-initial ">
          <img
            src={pinDetails?.image && urlFor(pinDetails.image).url()}
            className="rounded-t-3xl rounded-b-lg"
            alt="user-post"
          />
        </div>

        <div className="w-full p-5 flex-1 xl:min-w-620">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <a
                href={`${pinDetails?.image?.asset?.url}?dl=`}
                download
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="bg-gray-200 text-green-600 w-9 h-9 p-2 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
              >
                <MdDownloadForOffline />
              </a>
            </div>

            <a href={pinDetails?.destination} target="_blank">
              {pinDetails.destination}
            </a>
          </div>

          <div>
            <h1 className="text-4xl font-bold break-words mt-3">
              {pinDetails.title}
            </h1>

            <p className="mt-3">{pinDetails.about}</p>
          </div>

          <Link
            to={`/user-profile/${pinDetails?.postedBy?._id}`}
            className="flex gap-2 mt-5 items-center bg-white rounded-lg"
          >
            <img
              className="w-9 h-9 rounded-full object-cover"
              src={pinDetails?.postedBy?.image}
              alt="user-profile"
            />
            <p className="font-semibold text-lg capitalize">
              {pinDetails?.postedBy?.userName}
            </p>
          </Link>

          <h2 className="mt-5 text-2xl">Comments</h2>

          <div className="max-h-370 overflow-y-auto">
            {pinDetails?.comments?.map((comment, index) => (
              <div
                className="flex gap-2 mt-5 items-center bg-white rounded-lg"
                key={index}
              >
                <Link to={`/user-profile/${user?._id}`}>
                  <img
                    src={comment.postedBy.image}
                    alt="user-profile"
                    className="w-9 h-9 rounded-full cursor-pointer"
                  />
                </Link>

                <div className="flex flex-col">
                  <p className="font-bold">{comment.postedBy.userName}</p>
                  <p className="text-sm">{comment.comment}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap mt-6 gap-3 items-center">
            <Link to={`/user-profile/${user?._id}`}>
              <img
                className="w-9 h-9 rounded-full cursor-pointer"
                src={user?.image}
                alt="user-profile"
              />
            </Link>

            <input
              className="flex-1 border-gray-100 outline-white border-2 p-2 rounded-2xl focus:border-gray-300"
              type="text"
              placeholder="Add a comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              type="button"
              className="bg-red-500 text-white rounded-full px-6 py-2 font-semibold outline-none"
              onClick={addComment}
            >
              {addingComment ? "Posting comment..." : "Post"}
            </button>
          </div>
        </div>
      </div>

      {pins?.length > 0 ? (
        <>
          <h2 className="text-center font-bold text-2xl mt-8 mb-4 ">
            Similar Pins
          </h2>

          <MasonryLayout pins={pins} />
        </>
      ) : (
        <Spinner message="Loading similar Pins..." />
      )}
    </>
  );
};

export default PinDetails;
