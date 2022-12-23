import React, { useState, useEffect } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { client, urlFor } from "../client";
import MasonryLayout from "./MasonryLayout";
import { similarPinsQuery, pinDetailsQuery } from "../utils/data";
import Spinner from "./Spinner";

import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { AiTwotoneDelete } from "react-icons/ai";

import { useNavigate } from "react-router-dom";

const PinDetails = ({ user }) => {
  const [pins, setSimilarPins] = useState(null);
  const [pinDetails, setPinDetails] = useState(null);
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  const { pinId } = useParams();

  const navigate = useNavigate();

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

  const deletePin = (id) => {
    client.delete(id).then(() => {
      window.location.reload();
    });
  };

  let alreadySaved = pinDetails?.save?.filter(
    (item) => item?.postedBy?._id === user?._id
  );

  alreadySaved = alreadySaved?.length > 0 ? alreadySaved : [];

  const savePin = (id) => {
    if (alreadySaved?.length === 0) {
      setSavingPost(true);

      client
        .patch(id)
        .setIfMissing({ save: [] })
        .insert("after", "save[-1]", [
          {
            _key: uuidv4(),
            userId: user?._id,
            postedBy: {
              _type: "postedBy",
              _ref: user?._id,
            },
          },
        ])
        .commit()
        .then(() => {
          window.location.reload();
          setSavingPost(false);
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
            <div className="flex gap-3 items-center">
              <a
                href={`${pinDetails?.image?.asset?.url}?dl=`}
                download
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="bg-gray-200 text-green-600 w-12 h-12 p-2 rounded-full flex items-center justify-center text-dark text-3xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
              >
                <MdDownloadForOffline />
              </a>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePin(pinId);
                  navigate("/");
                }}
                className="bg-gray-200 text-red-500 w-12 h-12 p-2 rounded-full flex items-center justify-center text-dark text-3xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
              >
                <AiTwotoneDelete />
              </button>
            </div>

            <div className="truncate max-w-md ml-9 underline text-blue-500">
              <a href={pinDetails?.destination} target="_blank">
                {pinDetails.destination}
              </a>
            </div>
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

          <div className="flex flex-row gap-6">
            <h2 className="mt-5 text-2xl font-bold">Comments</h2>

            <span
              className="mt-4 bg-gray-200 w-9 h-9 p-1.5 rounded-full flex items-center justify-center text-dark text-3xl opacity-70 hover:opacity-100 hover:shadow-lg outline-none cursor-pointer"
              onClick={() => {
                setShowComments((prev) => !prev);
              }}
            >
              {showComments ? <IoIosArrowDown /> : <IoIosArrowForward />}
            </span>

            {alreadySaved?.length !== 0 ? (
              <button
                type="button"
                className="bg-gray-900 ml-2 mt-2 opacity-100 text-white font-bold px-5 py-1 text-sm rounded-3xl hover:shadow-md outline-none"
              >
                Saved
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  savePin(pinId);
                }}
                type="button"
                className={`opacity-80 ml-2 mt-2 hover:opacity-100 text-white font-bold px-5 py-1 text-sm rounded-3xl hover:shadow-md outline-none ${
                  savingPost ? "bg-gray-900" : "bg-red-500"
                }`}
              >
                {savingPost ? "Saving..." : "Save"}
              </button>
            )}
          </div>

          {showComments && (
            <div className="animate-slide-down">
              <div className="max-h-370 overflow-y-auto smooth-transition animate-slide-down">
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
          )}
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
