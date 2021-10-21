const LoadingPanel = ({width}) => (
  <div className="k-loading-mask" style={{ width: width }}>
    <span className="k-loading-text">Loading</span>
    <div className="k-loading-image"></div>
    <div className="k-loading-color"></div>
  </div>
);

export default LoadingPanel;