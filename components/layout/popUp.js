import { OverlayTrigger, Tooltip } from "react-bootstrap";

// Create a pop up message when hovering over the object
const PopUp = ({ id, children, title }) => (
    <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
      <span>{children}</span>
    </OverlayTrigger>
);

export default PopUp;