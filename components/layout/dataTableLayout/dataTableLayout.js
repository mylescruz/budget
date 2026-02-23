import ascendingDateSorter from "@/helpers/ascendingDateSorter";
import descendingDateSorter from "@/helpers/descendingDateSorter";
import dollarSorter from "@/helpers/dollarSorter";
import stringSorter from "@/helpers/stringSorter";
import { useEffect, useMemo, useState } from "react";
import DataTable from "./dataTable";
import DataTablePages from "./dataTablePages";
import DataTableSortDropdown from "./dataTableSortDropdown";
import DataTableFilterDropdown from "./dataTableFilterDropdown";
import DataTableSearchBar from "./dataTableSearchBar";

const sourcesPerPage = 20;

const allOptions = "All";

const DataTableLayout = ({ data, columns, openDetails, editable }) => {
  const sortOptions = [
    `${columns.column1} (Asc)`,
    `${columns.column1} (Desc)`,
    `${columns.column2} (Asc)`,
    `${columns.column2} (Desc)`,
    `${columns.column3} (Asc)`,
    `${columns.column3} (Desc)`,
    `${columns.column4} (Asc)`,
    `${columns.column4} (Desc)`,
  ];

  const [filterOption, setFilterOption] = useState(allOptions);
  const [sortOption, setSortOption] = useState(sortOptions[0]);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  // Reset the results if the type or search filter changes
  useEffect(() => {
    setPage(1);
  }, [filterOption, searchInput]);

  // Define the filter options the user can select from
  const filterOptions = useMemo(() => {
    setFilterOption(allOptions);

    const filteredData = ["All"];

    data.forEach((item) => {
      if (!filteredData.includes(item.type)) {
        filteredData.push(item.type);
      }
    });

    return filteredData;
  }, [data]);

  // Filters the array based on the selected filter option
  const filteredData = useMemo(() => {
    if (filterOption === "All") {
      return data;
    }

    return data.filter((item) => item.type === filterOption);
  }, [filterOption, data]);

  // Filters the array based on the searched input
  const searchedData = useMemo(() => {
    if (searchInput === "") {
      return filteredData;
    }

    return filteredData.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.description.toLowerCase().includes(searchInput.toLowerCase())
      );
    });
  }, [searchInput, filteredData]);

  // Sort the array based on the selected sort option
  const sortedData = useMemo(() => {
    let sorted;

    switch (sortOption) {
      case `${columns.column1} (Asc)`:
        sorted = ascendingDateSorter(searchedData);
        break;
      case `${columns.column1} (Desc)`:
        sorted = descendingDateSorter(searchedData);
        break;
      case `${columns.column2} (Asc)`:
        sorted = stringSorter(searchedData, "name", "asc");
        break;
      case `${columns.column2} (Desc)`:
        sorted = stringSorter(searchedData, "name", "desc");
        break;
      case `${columns.column3} (Asc)`:
        sorted = stringSorter(searchedData, "type", "asc");
        break;
      case `${columns.column3} (Desc)`:
        sorted = stringSorter(searchedData, "type", "desc");
        break;
      case `${columns.column4} (Asc)`:
        sorted = dollarSorter(searchedData, "amount", "asc");
        break;
      case `${columns.column4} (Desc)`:
        sorted = dollarSorter(searchedData, "amount", "desc");
        break;
      default:
        sorted = ascendingDateSorter(searchedData);
    }

    return sorted.slice(
      page * sourcesPerPage - sourcesPerPage,
      page * sourcesPerPage,
    );
  }, [searchedData, sortOption, page]);

  // Get the total pages for the array after the search and filter options to display for pagination
  const totalPages = Math.ceil(searchedData.length / sourcesPerPage);

  return (
    <div className="d-flex flex-column">
      <div className="d-flex align-items-center col-12 mt-2 mb-4 mx-auto">
        <div className="col-6 col-md-8 col-lg-10">
          <DataTableSearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
        </div>
        <div className="col-3 col-md-2 col-lg-1 d-flex justify-content-end">
          <DataTableFilterDropdown
            filterOptions={filterOptions}
            filterOption={filterOption}
            setFilterOption={setFilterOption}
          />
        </div>
        <div className="col-3 col-md-2 col-lg-1">
          <DataTableSortDropdown
            sortOptions={sortOptions}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
        </div>
      </div>

      <DataTable
        sortedData={sortedData}
        columns={columns}
        openDetails={openDetails}
        editable={editable}
      />

      {sortedData.length !== 0 && (
        <DataTablePages page={page} setPage={setPage} totalPages={totalPages} />
      )}
    </div>
  );
};

export default DataTableLayout;
