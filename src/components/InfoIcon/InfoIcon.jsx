import { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { TooltipContext } from '../../contexts/TooltipContext';

const InfoIcon = ({ message, label }) => {
  const [setTooltipContent, setShowTooltip] = useContext(TooltipContext);

  const handleTooltipTrigger = (e) => {
    // Stop event propagation to prevent card navigation when icon is clicked
    if (e) {
      e.stopPropagation();
    }
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
          e.stopPropagation(); // Stop propagation for keyboard events too
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