export const formatPostDate = (createdAt) => {
  const currentDate = new Date();
  const createdAtDate = new Date(createdAt);

  const timeDifferenceInSeconds = Math.floor(
    (currentDate - createdAtDate) / 1000,
  );

  const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
  const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);
  const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);

  if (timeDifferenceInDays > 1) {
    return createdAtDate.toLocaleDateString("pl-PL", {
      month: "short",
      day: "numeric",
    });
  } else if (timeDifferenceInDays === 1) {
    return "1 dzień";
  } else if (timeDifferenceInHours >= 1) {
    return `${timeDifferenceInHours} godz.`;
  } else if (timeDifferenceInMinutes >= 1) {
    return `${timeDifferenceInMinutes} min`;
  } else {
    return "właśnie teraz";
  }
};

export const formatMemberSinceDate = (createdAt) => {
  const date = new Date(createdAt);

  const months = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ];

  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `Dołączono ${month} ${year}`;
};
