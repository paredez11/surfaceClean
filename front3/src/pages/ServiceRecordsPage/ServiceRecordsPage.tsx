// front3/src/pages/ServiceRecordsPage/ServiceRecordsPage.tsx

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getServiceRecords } from "../../redux/serviceRecords";
import type { RootState } from "../../redux/store";
import type { ServiceRecordListItem } from "../../types";

import "./ServiceRecordsPage.css";

const ServiceRecordsPage = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const { records, loading, error } = useSelector(
    (state: RootState) => state.serviceRecords,
  );

  useEffect(() => {
    dispatch(getServiceRecords());
  }, [dispatch]);

  const customerName = (record: ServiceRecordListItem) => {
    if (!record.customer) {
      return "No customer";
    }

    if (
      record.customer.customer_type === "business" &&
      record.customer.business_name
    ) {
      return record.customer.business_name;
    }

    return [
      record.customer.first_name,
      record.customer.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatCost = (cost: number | null) => {
    if (cost === null) {
      return "Not recorded";
    }

    return cost.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  if (loading) {
    return (
      <main className="service-records-page">
        <p className="service-records-state">
          Loading service records...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="service-records-page">
        <p className="service-records-state service-records-error">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="service-records-page">
      <div className="service-records-header">
        <div>
          <h1>Service Records</h1>
          <p>
            Review completed service work across customer machines.
          </p>
        </div>

        <span className="service-records-count">
          {records.length}{" "}
          {records.length === 1 ? "record" : "records"}
        </span>
      </div>

      {records.length === 0 ? (
        <p className="service-records-state">
          No service records have been recorded.
        </p>
      ) : (
        <div className="service-records-grid">
          {records.map((record) => (
            <article
              key={record.id}
              className="service-record-card"
            >
              <div className="service-record-machine">
                <div className="service-record-badges">
                  <span className="service-type-badge">
                    {record.service_type}
                  </span>

                  {record.covered_by_warranty && (
                    <span className="warranty-covered-badge">
                      Warranty Covered
                    </span>
                  )}
                </div>

                <h2>{record.machine.name}</h2>
              </div>

              <div className="service-record-content">
                <div className="service-record-summary">
                  <div>
                    <span className="service-record-label">
                      Customer
                    </span>
                    <strong>{customerName(record)}</strong>
                  </div>

                  <div>
                    <span className="service-record-label">
                      Service Date
                    </span>
                    <strong>
                      {formatDate(record.service_date)}
                    </strong>
                  </div>
                </div>

                {record.reported_issue && (
                  <div className="service-record-section">
                    <span className="service-record-label">
                      Reported Issue
                    </span>
                    <p>{record.reported_issue}</p>
                  </div>
                )}

                {record.diagnosis && (
                  <div className="service-record-section">
                    <span className="service-record-label">
                      Diagnosis
                    </span>
                    <p>{record.diagnosis}</p>
                  </div>
                )}

                {record.work_performed && (
                  <div className="service-record-section">
                    <span className="service-record-label">
                      Work Performed
                    </span>
                    <p>{record.work_performed}</p>
                  </div>
                )}

                <div className="service-record-costs">
                  <div>
                    <span className="service-record-label">
                      Technician
                    </span>
                    <strong>
                      {record.technician || "Not recorded"}
                    </strong>
                  </div>

                  <div>
                    <span className="service-record-label">
                      Labor
                    </span>
                    <strong>
                      {formatCost(record.labor_cost)}
                    </strong>
                  </div>

                  <div>
                    <span className="service-record-label">
                      Parts
                    </span>
                    <strong>
                      {formatCost(record.parts_cost)}
                    </strong>
                  </div>

                  <div>
                    <span className="service-record-label">
                      Total
                    </span>
                    <strong>
                      {formatCost(record.total_cost)}
                    </strong>
                  </div>
                </div>

                {record.notes && (
                  <div className="service-record-section">
                    <span className="service-record-label">
                      Notes
                    </span>
                    <p>{record.notes}</p>
                  </div>
                )}

                {record.customer && (
                  <button
                    type="button"
                    className="service-record-customer-link"
                    onClick={() =>
                      navigate(
                        `/customers/${record.customer!.id}`,
                      )
                    }
                  >
                    View Customer
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default ServiceRecordsPage;