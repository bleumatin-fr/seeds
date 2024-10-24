import DateFnsAdapter from '@date-io/date-fns';

const dateFns = new DateFnsAdapter();

const formatDates = (dates: Date[]) => {
  return dates
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((currentDate, currentIndex) => {
      const previousDate: Date | null =
        new Date(dates[currentIndex - 1]) || null;
      const nextDate: Date | null = new Date(dates[currentIndex + 1]) || null;
      const isFirstOfMonth =
        new Date(currentDate).getMonth() !==
        (previousDate ? previousDate.getMonth() : -1);
      const isLastOfMonth =
        new Date(currentDate).getMonth() !==
        (nextDate ? nextDate.getMonth() : -1);

      if (isFirstOfMonth && !isLastOfMonth) {
        return dateFns.formatByString(new Date(currentDate), 'dd');
      }
      if (isLastOfMonth) {
        return dateFns.formatByString(new Date(currentDate), 'dd LLL yyyy');
      }
      return dateFns.formatByString(new Date(currentDate), 'dd LLL yyyy');
    });
};

export default formatDates;
