import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async (formData) => {
        try {
          const response = await fetch(`/api/users/update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Błąd aktualizacji profilu");
          }
          return data;
        } catch (error) {
          // eslint-disable-next-line preserve-caught-error
          throw new Error(error.message);
        }
      },
      onSuccess: () => {
        toast.success("Profil został zaktualizowany");
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ["authUser"] }),
          queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
        ]);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  return { updateProfile, isUpdatingProfile };
};
export default useUpdateUserProfile;
