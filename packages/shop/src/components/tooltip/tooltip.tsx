import { StyledTooltip, StyledTooltipText } from "./tooltip.style";

const Tooltip = (props) => {
  return (
    <StyledTooltip>
      {props.children}
      <StyledTooltipText open={props.open} placement={props.placement}>{props.title}</StyledTooltipText>
    </StyledTooltip>
  );
};

export default Tooltip;