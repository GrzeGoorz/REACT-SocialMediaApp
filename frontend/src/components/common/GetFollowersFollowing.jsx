import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import useFollow from "../../hooks/useFollow";

export const GetFollowers = ({ userId }) => {
  const { data: followers, isLoading } = useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/followers/${userId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Błąd pobierania obserwujących");
      }

      return data;
    },
    enabled: !!userId,
  });

  return (
    <dialog id="followers_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Obserwujący</h3>

        {isLoading && <p>Ładowanie...</p>}

        {!isLoading && followers?.length === 0 && (
          <p className="text-slate-500">Nikt jeszcze Cię nie obserwuje.</p>
        )}

        <div className="flex flex-col gap-2">
          {followers?.map((follower) => (
            <Link
              key={follower._id}
              to={`/profile/${follower.username}`}
              onClick={() =>
                document.getElementById("followers_modal")?.close()
              }
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary"
            >
              <img
                src={follower.profileImg || "/avatar-placeholder.png"}
                alt={follower.username}
                className="w-10 h-10 rounded-full object-cover"
              />

              <div>
                <p className="font-bold">{follower.fullname}</p>
                <p className="text-sm text-slate-500">@{follower.username}</p>
              </div>
            </Link>
          ))}
        </div>

        <form method="dialog" className="mt-4">
          <button type="submit" className="btn">
            Zamknij
          </button>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
};

export const GetFollowing = ({ userId }) => {
  const queryClient = useQueryClient();
  const { follow, isPending } = useFollow();

  // ID użytkownika, którego właśnie obsługujemy
  const [loadingUserId, setLoadingUserId] = useState(null);

  // Lista użytkowników, których aktualnie obserwujemy.
  // Dzięki temu możemy lokalnie zmieniać Unfollow -> Follow
  const [unfollowedUsers, setUnfollowedUsers] = useState([]);

  const { data: following = [], isLoading } = useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/following/${userId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Błąd pobierania obserwowanych");
      }

      return data;
    },
    enabled: !!userId,
  });

  const handleFollowToggle = (followingUserId) => {
    setLoadingUserId(followingUserId);

    follow(followingUserId, {
      onSuccess: () => {
        // Zmieniamy tylko przycisk konkretnego użytkownika.
        setUnfollowedUsers((prev) => {
          if (prev.includes(followingUserId)) {
            // Follow -> Unfollow
            return prev.filter((id) => id !== followingUserId);
          }

          // Unfollow -> Follow
          return [...prev, followingUserId];
        });

        setLoadingUserId(null);

        // Aktualizujemy authUser w tle,
        // ale NIE odświeżamy całej strony i NIE zamykamy modala.
        queryClient.invalidateQueries({
          queryKey: ["authUser"],
        });

        queryClient.invalidateQueries({
          queryKey: ["suggestedUsers"],
        });
      },

      onError: () => {
        setLoadingUserId(null);
      },
    });
  };

  return (
    <dialog id="following_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Obserwujesz</h3>

        {isLoading && <p>Ładowanie...</p>}

        {!isLoading && following.length === 0 && (
          <p className="text-slate-500">Nikogo jeszcze nie obserwujesz.</p>
        )}

        <div className="flex flex-col gap-2">
          {following.map((user) => {
            const isUnfollowed = unfollowedUsers.includes(user._id);

            const isLoadingThisUser = isPending && loadingUserId === user._id;

            return (
              <div
                key={user._id}
                className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-secondary"
              >
                {/* PROFIL */}
                <Link
                  to={`/profile/${user.username}`}
                  onClick={() =>
                    document.getElementById("following_modal")?.close()
                  }
                  className="flex items-center gap-3 min-w-0"
                >
                  <img
                    src={user.profileImg || "/avatar-placeholder.png"}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div className="min-w-0">
                    <p className="font-bold truncate">{user.fullname}</p>

                    <p className="text-sm text-slate-500">@{user.username}</p>
                  </div>
                </Link>

                {/* FOLLOW / UNFOLLOW */}
                <button
                  type="button"
                  className={`btn btn-sm rounded-full ${
                    isUnfollowed ? "btn-primary text-white" : "btn-outline"
                  }`}
                  disabled={isLoadingThisUser}
                  onClick={() => handleFollowToggle(user._id)}
                >
                  {isLoadingThisUser
                    ? "..."
                    : isUnfollowed
                      ? "Obserwuj"
                      : "Przestań obserwować"}
                </button>
              </div>
            );
          })}
        </div>

        {/* ZAMKNIĘCIE */}
        <form method="dialog" className="mt-4">
          <button type="submit" className="btn">
            Zamknij
          </button>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
};
