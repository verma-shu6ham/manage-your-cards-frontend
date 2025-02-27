import { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { TooltipContext } from '../../contexts/TooltipContext';

const InfoIcon = ({ message, label }) => {
  const [setTooltipContent, setShowTooltip] = useContext(TooltipContext);

  const handleTooltipTrigger = () => {
    setTooltipContent(message);
    setShowTooltip(true);
  };

  return (
    <span 
      className="info-icon"
      aria-label={`${label} Information`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleTooltipTrigger();
        }
      }}
      onClick={handleTooltipTrigger}
      title={message}
    >
      <FontAwesomeIcon icon={faInfoCircle} />
    </span>
  );
};

InfoIcon.propTypes = {
  message: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
};

export default InfoIcon; 