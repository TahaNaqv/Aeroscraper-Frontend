'use client';

import GradientButton from "@/components/Buttons/GradientButton"
import { Logo, RightArrow, TwitterLogo, DiscordLogo, NovaRatioIcon, MedalIcon } from "@/components/Icons/Icons"
import PYTH from "../public/images/pyth.svg"
import { WaveModal } from "@/components/Modal/WaveModal"
import Text from "@/components/Texts/Text"
import Image from "next/image";
import Link from "next/link"
import { useState } from "react"

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
    const [whiteSpaceModal, setWhiteSpaceModal] = useState(false);

    return (
        <>
            <img src='/images/left-secondary-wave.svg' className='absolute left-0 top-0 w-[60%] max-w-[871px] object-contain -z-20 select-none pointer-events-none' alt="left-wave-shadow" />
            <img src='/images/left-gradient-wave.svg' className='absolute left-0 top-0 w-1/2 max-w-[711px] object-contain -z-10 select-none pointer-events-none' alt="left-wave" />
            <img src='/images/landing-wave.svg' className='absolute right-0 lg:opacity-100 opacity-25 top-[213px] w-1/2 max-w-[900px] object-contain -z-10 select-none pointer-events-none' alt="landing-wave" />
            <header className='w-full flex flex-col items-end pt-8 pb-10 px-8'>
                <div className='flex items-center gap-6'>
                    <Text size='4xl'>Aeroscraper</Text>
                    <Logo className='lg:w-[96px] lg:h-[96px] w-[64px] h-[64px]' />
                </div>
                <Image src={PYTH} alt={"PYTH"} className="mr-48 mb-10" />
                <Link href={"/app/dashboard"}>
                    <GradientButton
                        className='w-full lg:w-[314px] self-end px-8 group'
                        endIcon={<RightArrow className='group-hover:translate-x-2 transition-all' />}
                    >
                        <Text size='3xl'>Launch App</Text>
                    </GradientButton>
                </Link>
            </header>
            <div className='container mx-auto px-8'>
                {children}
            </div>
            <footer className='flex justify-center sm:justify-between gap-x-48 gap-y-16 items-top flex-wrap px-24 pt-6 pr-16 pb-24 mt-auto relative'>
                <div className="flex-row flex gap-20 items-top">
                    <div className='flex flex-col items-center gap-6 lg:mt-20'>
                        <Logo />
                        <Text size="2xl" textColor='text-white'>Aeroscraper</Text>
                    </div>
                    <div className='flex flex-col items-center lg:justify-normal justify-center gap-4'>
                        <Text size="2xl" textColor='text-white'>Product</Text>
                        <Link href={'https://novaratio.gitbook.io/aeroscraper/aeroscraper/whitepaper'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                            <Text size="sm" textColor='text-white' className="cursor-pointer">Whitepaper</Text>
                        </Link>
                        <Link href={'https://aeroscraper.gitbook.io/aeroscraper/brand-identity/brand-kit'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                            <Text textColor='text-white'>Brand Identity</Text>
                        </Link>
                        {/* 
                        <button onClick={() => { setPrivacyModal(true); }}>
                            <Text textColor='text-ghost-white/75' className="cursor-pointer">Terms of service</Text>
                        </button> */}
                    </div>
                </div>
                <div className='flex flex-col items-center gap-6'>
                    <Text size="2xl">Definition of Aeroscraper</Text>
                    <div className='flex flex-col items-center gap-3'>
                        <Link href={'https://aeroscraper.gitbook.io/aeroscraper/definitions-of-aeroscraper/definition-of-name'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                            <Text textColor='text-white'>Definition of Name</Text>
                        </Link>
                        <Link href={'https://aeroscraper.gitbook.io/aeroscraper/definitions-of-aeroscraper/definition-of-icon'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                            <Text textColor='text-white'>Definition of Icon</Text>
                        </Link>
                        <Link href={'https://aeroscraper.gitbook.io/aeroscraper/definitions-of-aeroscraper/definition-of-colors'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                            <Text textColor='text-white'>Definition of Colors</Text>
                        </Link>
                        <Link href={'https://aeroscraper.gitbook.io/aeroscraper/definitions-of-aeroscraper/definition-of-typography'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                            <Text textColor='text-white'>Definition of Typography</Text>
                        </Link>
                        <Link href={'https://aeroscraper.gitbook.io/aeroscraper/'} className='hover:scale-105 transition-all flex gap-2'>
                            <Text textColor='text-white'>Definition of Concept</Text>
                        </Link>
                    </div>
                </div>
                <div className='flex flex-col items-center gap-6'>
                    <Text size="2xl">Community</Text>
                    <div className='flex flex-col items-center gap-4'>
                        <Link href={'https://twitter.com/aeroscraper'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                            <TwitterLogo />
                            <Text textColor='text-white'>X</Text>
                        </Link>
                        <Link href={'https://discord.gg/3R6yTqB8hC'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                            <DiscordLogo />
                            <Text textColor='text-white'>Discord</Text>
                        </Link>
                    </div>
                </div>
                <div className="absolute right-6 bottom-4 whitespace-nowrap flex items-end">
                    <Text size="base" textColor='text-white'>Product by</Text>
                    <Link className="ml-2 mb-0.5" href={"https://twitter.com/novaratiotech"} target="_blank" rel="noopener noreferrer">
                        <NovaRatioIcon />
                    </Link>
                </div>
            </footer>

            {/*             <Modal title="Terms of service" showModal={privacyModal} onClose={() => { setPrivacyModal(false); }} childrenClassName="h-[70%] overflow-y-scroll mt-10">
                <Text size="sm">Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet ab optio rem, perspiciatis eum quam alias magnam consequatur est ad pariatur corrupti, quidem soluta ipsam corporis tempore! Asperiores qui totam praesentium, animi perspiciatis ipsum illum velit at magnam fugit amet beatae dignissimos nemo magni accusantium. Minus corrupti rem ex maiores, amet magni saepe, eligendi vitae veritatis cupiditate officiis fugit expedita recusandae illo provident perspiciatis harum temporibus ut assumenda error! Perspiciatis soluta nemo id quaerat a eligendi commodi itaque corrupti, earum, dolorum velit ratione perferendis sapiente eum iure? Ipsa harum in aliquid provident repellendus est quaerat eaque. Possimus perferendis veniam quidem.               Lorem ipsum, dolor sit amet consectetur adipisicing elit. Mollitia facere dicta quis quos doloribus quas, iusto repudiandae? Beatae deleniti repellat, voluptatum rem enim eligendi inventore porro, animi vel aliquid totam ipsum quibusdam modi sed labore ipsa qui dicta tempora dolorum! Id nostrum voluptatibus velit, corporis doloremque qui repellat neque magni, adipisci laudantium sint minima sit soluta error excepturi amet alias placeat esse earum optio fugit. Aut repellat id dignissimos cumque ab quod quam voluptatem blanditiis, rem officia, odit sed tempora explicabo iusto aperiam, obcaecati quaerat fuga perferendis ex est quis placeat. Provident illo ab quidem ipsam perferendis facere consequatur eaque?
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Mollitia facere dicta quis quos doloribus quas, iusto repudiandae? Beatae deleniti repellat, voluptatum rem enim eligendi inventore porro, animi vel aliquid totam ipsum quibusdam modi sed labore ipsa qui dicta tempora dolorum! Id nostrum voluptatibus velit, corporis doloremque qui repellat neque magni, adipisci laudantium sint minima sit soluta error excepturi amet alias placeat esse earum optio fugit. Aut repellat id dignissimos cumque ab quod quam voluptatem blanditiis, rem officia, odit sed tempora explicabo iusto aperiam, obcaecati quaerat fuga perferendis ex est quis placeat. Provident illo ab quidem ipsam perferendis facere consequatur eaque? ipsum dolor sit amet consectetur adipisicing elit. Eveniet ab optio rem, perspiciatis eum quam alias magnam consequatur est ad pariatur corrupti, quidem soluta ipsam corporis tempore! Asperiores qui totam praesentium, animi perspiciatis ipsum illum velit at magnam fugit amet beatae dignissimos nemo magni accusantium. Minus corrupti rem ex maiores, amet magni saepe, eligendi vitae veritatis cupiditate officiis fugit expedita recusandae illo provident perspiciatis harum temporibus ut assumenda error! Perspiciatis soluta nemo id quaerat a eligendi commodi itaque corrupti, earum, dolorum velit ratione perferendis sapiente eum iure? Ipsa harum in aliquid provident repellendus est quaerat eaque. Possimus perferendis veniam quidem.               Lorem ipsum, dolor sit amet consectetur adipisicing elit. Mollitia facere dicta quis quos doloribus quas, iusto repudiandae? Beatae deleniti repellat, voluptatum rem enim eligendi inventore porro, animi vel aliquid totam ipsum quibusdam modi sed labore ipsa qui dicta tempora dolorum! Id nostrum voluptatibus velit, corporis doloremque qui repellat neque magni, adipisci laudantium sint minima sit soluta error excepturi amet alias placeat
                </Text>
            </Modal> */}

            <WaveModal title="Whitepaper" showModal={whiteSpaceModal} onClose={() => { setWhiteSpaceModal(false); }} childrenClassName="h-[70%] overflow-y-scroll mt-10">
                <>
                    <Text size="2xl">Aeroscraper</Text>
                    <Text size="base" className="mt-2">Governance-free, interest-free, decentralized lending-borrowing protocol.</Text>
                    <Text size="lg" className="mt-4">Our Vision</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">“The core objective of the Aeroscraper revolves around bolstering the establishment, expansion, and widespread acceptance of a highly secure, trustless, and decentralized financial framework. By being community-owned, it aims to instill enhanced stability and transparency into DeFi.”</Text>
                    <Text size="lg" className="mt-4">Intro</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">Aeroscraper is the first truly decentralized lending protocol built on Sei Network, Archway, Neutron and Shardeum. Its operations are immutable, non-custodial, and governance-free. It is a finished product with no admin keys.</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">
                        The protocol was developed to allow owners of SEI, ARCH, NTRN, ETH, ATOM a method of extracting value from their holdings, without the need to ever sell. By locking up SEI, ARCH, NTRN, ETH, ATOM coins and minting aUSD (a USD pegged stablecoin), a SEI, ARCH, NTRN, ETH, ATOM holder can take a 0% interest-free loan against their holdings, on a timeless repayment schedule.</Text>
                    <Text size="lg" className="mt-4">What is Aeroscraper?</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">Aeroscraper is a decentralized lending protocol that allows you to draw interest-free loans against SEI, ARCH, NTRN, ETH, ATOM used as collateral.</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">
                        Users deposit SEI, ARCH, NTRN, ETH, ATOM and mint aUSD (stablecoin). These individual collateralized debt positions are called troves. The minted stablecoins are economically geared towards maintaining a value of 1 aUSD = $1 USD of SEI, ARCH, NTRN, ETH, ATOM value, due to the following properties;
                    </Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">
                        1. The system is designed to always be over-collateralized. The dollar value of the locked SEI, ARCH, NTRN, ETH, ATOM exceeds the dollar value of the issued stablecoins.
                    </Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">
                        2. The stablecoins are fully redeemable. Users can always swap aUSD for SEI, ARCH, NTRN, ETH, ATOM (minus fees), directly within the system.
                    </Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">
                        3. The system controls the generation of aUSD.
                        The operations are done algorithmically, through a variable issuance fee.
                    </Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">
                        After opening a Vault, users mint their own stablecoin to a collateral ratio of at least 115%. As an example, a user with $11,500 worth of SEI, ARCH, NTRN, ETH, ATOM can mint up to 10,000 aUSD.
                    </Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">The tokens are freely exchangeable – anyone can send or receive aUSD tokens. aUSD tokens are burned upon repayment of a Trove’s debt or via a directly redemption process.
                    </Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">
                        The Aeroscraper system regularly updates the (SEI, ARCH, NTRN, ETH, ATOM):USD price via a decentralized data feed. When a Vault falls below a minimum collateralization ratio (MCR) of 115%, it is considered under-collateralized, and is vulnerable to liquidation. This is to ensure the protocol remains solvent at all times, and 1 aUSD can always be redeemed for $1 USD worth of SEI, ARCH, NTRN, ETH, ATOM.
                    </Text>
                    <Text size="lg" className="mt-4">What’s the motivation behind Aeroscraper?</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">
                        The protocol was developed to allow owners of SEI, ARCH, NTRN, ETH, ATOM a method of extracting value from their holdings, without the need to ever sell their tokens. By locking up SEI, ARCH, NTRN, ETH, ATOM and minting aUSD, SEI, ARCH, NTRN, ETH, ATOM holders can take a 0% interest-free loan against their holdings, on a timeless repayment schedule.</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">Stablecoins are an essential building block on any blockchain. However, the vast majority of this value is made up of centralized stablecoins. Decentralized stablecoins make up only a small portion of the total stablecoin supply.</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">Aeroscraper addresses this by creating a more capital-efficient and user-friendly way to borrow a decentralized stablecoin.
                        Furthermore, Aeroscraper is completely immutable, governance-free, and non-custodial.</Text>
                    <Text size="lg" className="mt-4">What are the key benefits of Aeroscraper?</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">0% interest rate – as a borrower, there’s no need to worry about constantly accruing debt.</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">115% MCR – a low minimum collateralization ratio means more efficient usage of your deposited SEI, ARCH, NTRN, ETH, ATOM.</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">Governance free – all operations are algorithmic and fully automated, and protocol parameters are set at time of deployment.</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">Directly redeemable – the protocol allows you to exchange 1 aUSD stablecoin for $1 USD worth of SEI, ARCH, NTRN, ETH, ATOM at any time.</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">Fully decentralized – the contracts have no admin keys and can be accessible via other front ends, making it censorship resistant. Borrow aUSD against SEI, ARCH, NTRN, ETH, ATOM by opening a ‘​Trove’.</Text>
                    <Text size="lg" className="mt-4">Does anyone “own” or operate the protocol?</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">No. The contract is immutable and therefore has no owner or operator.</Text>
                    <Text size="lg" className="mt-4">Can Aeroscraper be upgraded or changed?</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">
                        No. The protocol has no admin key, and nobody can alter the rules of the system in any way. The smart contract code is completely immutable once deployed.
                    </Text>
                    <Text size="lg" className="mt-4">Has the protocol been third-party verified, certified, and/or audited?</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">The protocol will be audited and the full report will be made publicly available.</Text>
                    <Text size="lg" className="mt-4">What are the main use cases of Aeroscraper?</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">Borrow aUSD against SEI, ARCH, NTRN, ETH, ATOM by opening a ‘​Trove’.</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">Deposit aUSD to the Stability Pool and earn liquidation gains in SEI, ARCH, NTRN, ETH, ATOM as rewards.</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">Redeem 1 aUSD for $1 USD worth of SEI, ARCH, NTRN, ETH, ATOM at any time.</Text>
                    <Text size="sm" className="mt-2" textColor="text-gray-300">Arbitrage potential gains if the 1 aUSD peg falls below $1 USD.</Text>


                </>
            </WaveModal>
        </>
    )
}

export default LandingLayout
