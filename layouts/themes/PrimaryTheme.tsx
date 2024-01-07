import { Logo } from "@/components/Icons/Icons"
import { TowerAnimation } from "@/components/Icons/TowerAnimation"
import { FC } from "react"
import Text from "@/components/Texts/Text"
import { ChainName } from "@/enums/Chain"

export const PrimaryTheme: FC<{ selectedChainName: ChainName | undefined }> = ({ selectedChainName }) => {

  return <div className="px-8">
    <TowerAnimation />
    <img src='/images/bg-shape-1.svg' className='fixed right-0 top-0 -z-20 select-none pointer-events-none' alt="tower" />
    <img src='/images/bg-shape-2.svg' className='fixed right-4 top-[420px] -z-20 select-none pointer-events-none' alt="tower" />
    <img src='/images/bg-shape-3.svg' className='fixed right-16 bottom-0 -z-20 select-none pointer-events-none' alt="tower" />
    <header className='w-full flex flex-col items-end gap-10 pt-8 pb-4 px-8 mb-6'>
      <div className='flex items-center gap-6'>
        <Text size='3xl'>Aeroscraper</Text>
        <Logo className='lg:w-[72px] lg:h-[72px] w-[64px] h-[64px]' />
      </div>
      {selectedChainName && (
        <div className={`flex items-center absolute ${selectedChainName === ChainName.ARCHWAY ? "top-20 right-32" : selectedChainName === ChainName.NEUTRON ? "top-[84px] right-32" : selectedChainName === ChainName.INJECTIVE ? "top-[90px] right-32" : "top-14 right-40"}`}>
          <Text size='lg'>on</Text>
          {
            selectedChainName == ChainName.ARCHWAY ?
              <img alt={selectedChainName} src={"/images/token-images/archway.svg"} className='w-full h-12 -ml-1' /> :
              selectedChainName == ChainName.NEUTRON ?
                <img alt={selectedChainName} src={"/images/token-images/neutron-network.svg"} className='w-full h-5 ml-2' />
                :
                selectedChainName == ChainName.INJECTIVE ?
                  <img alt={selectedChainName} src={"/images/token-images/injective.svg"} className='w-full h-5 ml-2' />
                  :
                  <img alt={selectedChainName} src={"/images/token-images/sei-red.svg"} className='w-full h-24 -ml-2' />

          }
        </div>
      )}
    </header>
  </div>
}