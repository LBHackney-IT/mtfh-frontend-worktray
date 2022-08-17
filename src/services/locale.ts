const locale = {
  title: "Your tasks",
  views: {
    worktray: {
      noWorktrayResults: "No worktray results",
    },
  },
  errors: {
    unableToFetchRecord: "There was a problem retrieving the record",
    unableToFetchRecordDescription:
      "Please try again. If the issue persists, please contact support.",
    unableToFindProcess: "Invalid Process",
    unableToFindProcessDescription: "We have been unable to find a process of this type.",
    unableToFindState: "Invalid State",
    unableToFindStateDescription: "We have been unable to process a state of this type.",
  },
  components: {
    filters: {
      applyFilters: "Apply filters",
      clearFilters: "Clear filters",
      selectAll: "Select All",
    },
    pagination: {
      previous: "Previous",
      next: "Next",
      assistiveNavigation: (page: number): string => `Page ${page}`,
      searchResultsCounter: (page: number, pageSize: number, total: number): string =>
        `Showing ${page * pageSize - pageSize + 1}—${Math.min(
          page * pageSize,
          total,
        )} of ${total} results`,
    },
    controls: {
      timePeriodOptions: {
        "30": "Last 30 days",
        "60": "Last 60 days",
        "3": "Last 3 months",
        "6": "Last 6 months",
        "12": "Last 12 months",
      },
      limitOption: (value: number): string => `${value} items`,
    },
  },
};

export default locale;
