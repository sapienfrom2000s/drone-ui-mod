import { useState, useEffect } from 'react';

import { axiosWrapper } from 'utils';

const useRepoBranches = (repoName) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      if (!repoName) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Updated API endpoint format: /branches/:name instead of /list-branches?repoName=$name
        const response = await axiosWrapper(`${process.env.REACT_APP_BRANCHES_API}/${repoName}`);

        // Extract branch names from the new response format
        // New response format: {"branches":[{"name":"branch-name","created_at":"date","created_by":"user"}],"repository":"repo-name"}
        const branchNames = response.branches ? response.branches.map(branch => branch.name) : [];
        setData(branchNames);
        setError(null);
      } catch (err) {
        setError(err);
        // eslint-disable-next-line no-console
        console.error('Error fetching branches:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, [repoName]);

  return {
    data,
    isLoading,
    isError: error,
  };
};

export default useRepoBranches;
