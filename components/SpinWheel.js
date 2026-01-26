export default function SpinWheel() {
  const foods = ['🍕', '🍔', '🌮', '🍣', '🍜', '🍛', '🥗', '🍟', '🥘', '🍝'];
  
  return (
    <div className="mt-6 flex flex-col items-center justify-center py-8">
      <div className="relative w-24 h-24">
        {/* Spinning circle of food emojis */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '0.5s' }}>
          {foods.map((food, index) => (
            <span
              key={index}
              className="absolute text-3xl"
              style={{
                transform: `rotate(${index * 36}deg) translateY(-40px)`,
                transformOrigin: 'center center',
                left: '50%',
                top: '50%',
                marginLeft: '-0.5em',
                marginTop: '-0.5em',
              }}
            >
              {food}
            </span>
          ))}
        </div>
        {/* Center question mark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl animate-pulse">❓</span>
        </div>
      </div>
      <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">
        Finding your perfect meal...
      </p>
    </div>
  );
}
