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

const DataTableLayout = ({ formattedArray, columnNames }) => {
  const sortOptions = [
    `${columnNames.column1} (Asc)`,
    `${columnNames.column1} (Desc)`,
    `${columnNames.column2} (Asc)`,
    `${columnNames.column2} (Desc)`,
    `${columnNames.column3} (Asc)`,
    `${columnNames.column3} (Desc)`,
    `${columnNames.column4} (Asc)`,
    `${columnNames.column4} (Desc)`,
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

    const filteredArray = ["All"];

    formattedArray.forEach((elem) => {
      if (!filteredArray.includes(elem.type)) {
        filteredArray.push(elem.type);
      }
    });

    return filteredArray;
  }, [formattedArray]);

  // Filters the array based on the selected filter option
  const filteredArray = useMemo(() => {
    if (filterOption === "All") {
      return formattedArray;
    }

    return formattedArray.filter((elem) => elem.type === filterOption);
  }, [filterOption, formattedArray]);

  // Filters the array based on the searched input
  const searchedArray = useMemo(() => {
    if (searchInput === "") {
      return filteredArray;
    }

    return filteredArray.filter((elem) => {
      return (
        elem.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        elem.description.toLowerCase().includes(searchInput.toLowerCase())
      );
    });
  }, [searchInput, filteredArray]);

  // Sort the array based on the selected sort option
  const sortedArray = useMemo(() => {
    let sorted;

    switch (sortOption) {
      case `${columnNames.column1} (Asc)`:
        sorted = ascendingDateSorter(searchedArray);
        break;
      case `${columnNames.column1} (Desc)`:
        sorted = descendingDateSorter(searchedArray);
        break;
      case `${columnNames.column2} (Asc)`:
        sorted = stringSorter(searchedArray, "name", "asc");
        break;
      case `${columnNames.column2} (Desc)`:
        sorted = stringSorter(searchedArray, "name", "desc");
        break;
      case `${columnNames.column3} (Asc)`:
        sorted = stringSorter(searchedArray, "type", "asc");
        break;
      case `${columnNames.column3} (Desc)`:
        sorted = stringSorter(searchedArray, "type", "desc");
        break;
      case `${columnNames.column4} (Asc)`:
        sorted = dollarSorter(searchedArray, "amount", "asc");
        break;
      case `${columnNames.column4} (Desc)`:
        sorted = dollarSorter(searchedArray, "amount", "desc");
        break;
      default:
        sorted = ascendingDateSorter(searchedArray);
    }

    return sorted.slice(
      page * sourcesPerPage - sourcesPerPage,
      page * sourcesPerPage,
    );
  }, [searchedArray, sortOption, page]);

  // Get the total pages for the array after the search and filter options to display for pagination
  const totalPages = Math.ceil(searchedArray.length / sourcesPerPage);

  return (
    <div className="d-flex flex-column">
      <div className="d-flex align-items-center col-12 mt-2 mb-4 mx-auto">
        <div className="col-6 col-md-8 col-lg-10">
          <DataTableSearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
        </div>
        <div className="col-3 col-md-2 col-lg-1">
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

      <DataTable sortedArray={sortedArray} columnNames={columnNames} />

      {sortedArray.length !== 0 && (
        <DataTablePages page={page} setPage={setPage} totalPages={totalPages} />
      )}
    </div>
  );
};

export default DataTableLayout;
