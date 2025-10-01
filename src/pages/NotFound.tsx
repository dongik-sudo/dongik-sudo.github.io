import FuzzyText from "../components/FuzzyText";



export default function NotFound() {
    return (
        <div className="flex justify-center items-center flex-col gap-10">
            <div className="inline-block mt-20">
                <FuzzyText
                    baseIntensity={0.2}
                    hoverIntensity={0.4}
                    enableHover={true}
                >
                    404
                </FuzzyText>
            </div>
            <div className="inline-block -mt-5">
                <FuzzyText
                    baseIntensity={0.2}
                    hoverIntensity={0.4}
                    enableHover={true}

                    fontSize="clamp(1rem, 8vw, 4rem)"
                >
                    Not Found
                </FuzzyText>
            </div>
        </div>
    );
}