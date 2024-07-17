import React, { useState, useEffect } from "react";
import "./index.css";
import {
  FaSun,
  FaMoon,
  FaTrashAlt,
  FaSyncAlt,
  FaInfoCircle,
  FaSpinner,
  FaDownload,
} from "react-icons/fa";
import axios from "axios";

const Table = () => {
  const [isNightMode, setIsNightMode] = useState(false);
  const [filter, setFilter] = useState("All Apps");
  const [sortBy, setSortBy] = useState("Default");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    deleteAll: false,
    checkUpdates: false,
    update: null,
    delete: null,
  });
  const [blinkingRow, setBlinkingRow] = useState(null);

  const baseURL = "http://localhost:5000/api/apps/";

  const headers = [
    { name: "No", tooltip: "Number" },
    { name: "App Name", tooltip: "Application Name" },
    { name: "AZ Version", tooltip: "ApkZalmi Version" },
    { name: "GP Version", tooltip: "Google Play Version" },
    { name: "Status", tooltip: "Application Status" },
    { name: "Update Date", tooltip: "Date of Last Google Play Update" },
    { name: "Publish Date", tooltip: "Date of Last Update" },
    { name: "Delete", tooltip: "Delete Application" },
    { name: "Check Update", tooltip: "Check for Updates" },
    { name: "Open GP", tooltip: "Open Google Play" },
    { name: "Open Post", tooltip: "Open Post" },
  ];

  const fetchApps = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await axios.get(`${baseURL}fetch`);
      setData(response.data.apps);
    } catch (error) {
      console.error("Error fetching apps:", error);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const loadAllApps = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await axios.get(baseURL);
      setData(response.data.apps);
    } catch (error) {
      console.error("Error loading all apps:", error);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const deleteAllApps = async () => {
    setLoading((prev) => ({ ...prev, deleteAll: true }));
    try {
      await axios.delete(`${baseURL}delete`);
      await loadAllApps();
    } catch (error) {
      console.error("Error deleting all apps:", error);
    } finally {
      setLoading((prev) => ({ ...prev, deleteAll: false }));
    }
  };

  const checkAllUpdates = async () => {
    setLoading((prev) => ({ ...prev, checkUpdates: true }));
    try {
      await axios.get(`${baseURL}check-updates`);
      await loadAllApps();
    } catch (error) {
      console.error("Error checking updates:", error);
    } finally {
      setLoading((prev) => ({ ...prev, checkUpdates: false }));
    }
  };

  const deleteApp = async (id) => {
    setLoading((prev) => ({ ...prev, delete: id }));
    try {
      await axios.delete(`${baseURL}delete/${id}`);
      setBlinkingRow({ id, type: "delete" });
      setTimeout(() => setBlinkingRow(null), 1000);
      await loadAllApps();
    } catch (error) {
      console.error("Error deleting app:", error);
    } finally {
      setLoading((prev) => ({ ...prev, delete: null }));
    }
  };

  const checkUpdateForApp = async (id) => {
    setLoading((prev) => ({ ...prev, update: id }));
    try {
      await axios.get(`${baseURL}check-update/${id}`);
      setBlinkingRow({ id, type: "update" });
      setTimeout(() => setBlinkingRow(null), 1000);
      await loadAllApps();
    } catch (error) {
      console.error("Error checking update for app:", error);
    } finally {
      setLoading((prev) => ({ ...prev, update: null }));
    }
  };

  useEffect(() => {
    loadAllApps();
  }, []);

  const handleSort = (a, b) => {
    if (sortBy === "Update Date Ascending") {
      return new Date(a.googleUpdateDate) - new Date(b.googleUpdateDate);
    } else if (sortBy === "Publish Date Ascending") {
      return new Date(a.publishDate) - new Date(b.publishDate);
    } else if (sortBy === "Update Date Descending") {
      return new Date(b.googleUpdateDate) - new Date(a.googleUpdateDate);
    } else if (sortBy === "Publish Date Descending") {
      return new Date(b.publishDate) - new Date(a.publishDate);
    }
    return 0; // Default, no sorting
  };

  const filteredData = data
    .filter((item) => {
      if (filter === "All Apps") return true;
      if (filter === "Need Update Apps" && item.status === "Need Update")
        return true;
      if (filter === "Updated Apps" && item.status === "Updated") return true;
      return false;
    })
    .sort(handleSort);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div
      className={`flex justify-center items-center min-h-screen ${
        isNightMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div className="container mx-auto my-8 px-4">
        <div className="flex justify-center items-center">
          <h1 className="big-badge">ApkZalmi App Version Checker (v1.0)</h1>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <button
              onClick={fetchApps}
              className={`action-button fetch ${
                isNightMode ? "night-mode" : ""
              }`}
              disabled={
                loading.fetch || loading.deleteAll || loading.checkUpdates
              }
              aria-label="Fetch Apps from ApkZalmi"
            >
              <div className="flex items-center">
                {!loading.fetch && <FaDownload className="mr-2" />}
                Fetch Apps from ApkZalmi
                {loading.fetch && <FaSpinner className="ml-2 animate-spin" />}
              </div>
            </button>
            <button
              onClick={checkAllUpdates}
              className={`action-button update ${
                isNightMode ? "night-mode" : ""
              }`}
              disabled={
                loading.checkUpdates || loading.fetch || loading.deleteAll
              }
              aria-label="Check Updates"
            >
              <div className="flex items-center">
                {!loading.checkUpdates && <FaSyncAlt className="mr-2" />}
                Check Updates
                {loading.checkUpdates && (
                  <FaSpinner className="ml-2 animate-spin" />
                )}
              </div>
            </button>
            <button
              onClick={deleteAllApps}
              className={`action-button delete-all ${
                isNightMode ? "night-mode" : ""
              }`}
              disabled={
                loading.deleteAll || loading.fetch || loading.checkUpdates
              }
              aria-label="Delete All"
            >
              <div className="flex items-center">
                {!loading.deleteAll && <FaTrashAlt className="mr-2" />}
                Delete All
                {loading.deleteAll && (
                  <FaSpinner className="ml-2 animate-spin" />
                )}
              </div>
            </button>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`dropdown ${
                isNightMode ? "night-mode" : ""
              } ${filter.replace(/\s+/g, "-").toLowerCase()}`}
              aria-label="Filter Apps"
            >
              <option value="All Apps">All Apps</option>
              <option value="Need Update Apps">Need Update Apps</option>
              <option value="Updated Apps">Updated Apps</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`dropdown sort-by-dropdown ${
                isNightMode ? "night-mode" : ""
              } ${sortBy.replace(/\s+/g, "-").toLowerCase()}`}
              aria-label="Sort Apps"
            >
              <option value="Default">Default</option>
              <option value="Update Date Ascending">
                Update Date Ascending
              </option>
              <option value="Publish Date Ascending">
                Publish Date Ascending
              </option>
              <option value="Update Date Descending">
                Update Date Descending
              </option>
              <option value="Publish Date Descending">
                Publish Date Descending
              </option>
            </select>
          </div>
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className="night-mode-button"
            aria-label="Toggle Night Mode"
          >
            {isNightMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
        <div
          className={`overflow-y-auto max-h-[500px] shadow-md sm:rounded-lg ${
            isNightMode ? "night-mode" : ""
          }`}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${isNightMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <tr>
                {headers.map((header) => (
                  <th key={header.name} className="table-header">
                    <div className="flex items-center">
                      {header.name}
                      <FaInfoCircle
                        className="info-icon"
                        title={header.tooltip}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={`${
                isNightMode ? "bg-gray-900" : "bg-white"
              } divide-y divide-gray-200`}
            >
              {filteredData.map((item, index) => (
                <tr
                  key={item._id}
                  className={`table-row ${
                    isNightMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  } ${
                    blinkingRow && blinkingRow.id === item._id
                      ? blinkingRow.type === "delete"
                        ? isNightMode
                          ? "bg-red-600"
                          : "blink-red"
                        : isNightMode
                          ? "bg-blue-600"
                          : "blink-blue"
                      : ""
                  }`}
                >
                  <td className="table-cell">{index + 1}</td>
                  <td className="table-cell">{item.name}</td>
                  <td className="table-cell">{item.apkZalmiVersion}</td>
                  <td className="table-cell">{item.googlePlayVersion}</td>
                  <td className="table-cell">
                    <span
                      className={`badge ${
                        item.status === "Updated"
                          ? "badge-updated"
                          : "badge-needs-update"
                      }`}
                    >
                      <span
                        className={`dot ${
                          item.status === "Updated"
                            ? "dot-updated"
                            : "dot-needs-update"
                        }`}
                      ></span>
                      {item.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    {formatDate(item.googleUpdateDate)}
                  </td>
                  <td className="table-cell">{formatDate(item.publishDate)}</td>
                  <td className="table-cell">
                    <button
                      onClick={() => deleteApp(item._id)}
                      className="table-button-delete"
                      disabled={loading.delete === item._id}
                      aria-label="Delete"
                    >
                      {loading.delete === item._id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrashAlt />
                      )}
                    </button>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => checkUpdateForApp(item._id)}
                      className="table-button-update"
                      disabled={loading.update === item._id}
                      aria-label="Update"
                    >
                      {loading.update === item._id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaSyncAlt />
                      )}
                    </button>
                  </td>
                  <td className="table-cell">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button
                        className="table-button-open"
                        aria-label="Open GP"
                      >
                        Open
                      </button>
                    </a>
                  </td>
                  <td className="table-cell">
                    <a
                      href={item.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button
                        className="table-button-open"
                        aria-label="Open Post"
                      >
                        Open
                      </button>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
