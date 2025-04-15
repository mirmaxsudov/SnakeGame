import AiSnake from "../snake/AiSnake";
import {Link} from "react-router-dom";

const HomePage = () => {
    return (
        <>
            <section className={"home-section"}>
                <div className={"container mx-auto"}>
                    <div className={"mt-[60px]"}>
                        <AiSnake/>
                    </div>
                    <div className={"text-center"}>
                        <h1 className={"text-[40px] font-semibold tracking-wider"}>
                            Snake Game
                        </h1>
                        <div className={"inline-flex gap-[14px] mt-[10px]"}>
                            <button className={"py-2 px-4 rounded-[12px] border"}>
                                <Link to={"/ai"}>Computer</Link>
                            </button>
                            <button className={"py-2 px-4 rounded-[12px] border"}>
                                <Link to={"/with-ai"}>With Computer</Link>
                            </button>
                            <button className={"py-2 px-4 rounded-[12px] border"}>
                                <Link to={"/two"}>Two Snake</Link>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default HomePage;