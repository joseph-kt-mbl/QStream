import PropTypes from 'prop-types';

const AuthImagePattern = ({ title ='title', subtitle='subtitle' }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-primary/10 ${
                i % 2 === 0 ? 'animate-pulse' : ''
              }`}
            />
          ))}
        </div>
        <h2 className="text-2xl nb-4 text-bold">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

AuthImagePattern.propTypes = {
  title: PropTypes.string.isRequired, // Specifies that title is a required string
  subtitle: PropTypes.string,         // Specifies that subtitle is an optional string
};

AuthImagePattern.defaultProps = {
  subtitle: '', // Default value for subtitle if not provided
};

export default AuthImagePattern;
