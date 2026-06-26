import dollarFormatter from "@/helpers/dollarFormatter";
import { Col } from "react-bootstrap";

const DebtSummaryCard = ({
  title,
  amount,
  icon,
  textColor = "",
  subtitle,
  onClick,
}) => {
  return (
    <Col xs={12} md={6} xl={3}>
      <div className="bg-white rounded-3 shadow-sm p-3 h-100">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="text-muted mb-1">{title}</h6>

            <h3 className={`fw-bold mb-0 ${textColor}`}>
              {typeof amount === "number" ? dollarFormatter(amount) : amount}
            </h3>
          </div>

          {icon && <i className={`bi ${icon} fs-3 text-primary`} />}
        </div>

        {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}

        {onClick && (
          <p className="text-muted small clicker m-0 mt-2" onClick={onClick}>
            View Details <i className="bi bi-arrow-right small" />
          </p>
        )}
      </div>
    </Col>
  );
};

export default DebtSummaryCard;
