import Head from "next/head";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Actor, HttpAgent } from "@dfinity/agent";
import fetch from "isomorphic-fetch";
// import { idlFactory } from "../../../../.dfx/local/canisters/swap";
const host =
  process.env.DFX_NETWORK === "local"
    ? "http://127.0.0.1:4943"
    : "https://icp-api.io";

const agent = new HttpAgent({ fetch, host });
// const actor= Actor.createActor()

type Token = {
  name: string;
  symbol: string;
  quantity: number;
  from: boolean;
  usd: number;
};

export default function Home() {
  const [transfering, setTransfering] = useState(false);
  const [tokens, setTokens] = useState<[Token, Token]>([
    {
      name: "TokenA",
      symbol: "TA",
      quantity: 0,
      from: true,
      usd: 0.0,
    },
    {
      name: "TokenB",
      symbol: "TB",
      quantity: 0,
      from: false,
      usd: 0.0,
    },
  ]);
  const [inp, sInp] = useState("0.0");
  const [ic, setIc] = useState<any>(null);
  const [r, setR] = useState(false);
  const [balance, setBalance] = useState<any>([1000000, 1000000]);
  useEffect(() => {
    // @ts-ignore
    setIc(window.ic.plug);
  }, [r]);

  return (
    <>
      <Head>
        <title>xchnge</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-gradient flex min-h-screen  flex-col items-center justify-center text-foreground">
        <p className="mb-3 text-6xl font-bold">SwapNexus</p>
        <p className="mb-6 text-center font-bold text-[#A4A4A4]">
          Welcome to SwapNexus, your gateway to seamless token swaps across
          diverse blockchain networks
        </p>
        <div className="flex w-fit flex-col items-center justify-center  gap-8 rounded-[32px] bg-[#121212]/75 px-6 py-6">
          <div className="flex w-full justify-between">
            <Button
              // onClick={() => {
              //   setTokens([
              //     { ...tokens[1], from: true },
              //     { ...tokens[0], from: false },
              //   ]);
              // }}
              variant="outline"
              className=" hidden items-center gap-2 rounded-full bg-[#1B1B1B] px-6"
            >
              <span>Switch</span>
              <Icons.dollar className="h-4 w-4" />
            </Button>
            {!ic?.accountId ? (
              <Button
                variant="outline"
                className="flex items-center gap-2 rounded-full bg-[#1B1B1B] px-6"
                onClick={async () => {
                  try {
                    // @ts-ignore
                    const publicKey = await window.ic.plug.requestConnect();
                    console.log(
                      `The connected user's public key is:`,
                      publicKey,
                    );
                    const requestBalanceResponse =
                      // @ts-ignore
                      await window.ic?.plug?.requestBalance();
                    // setBalance(requestBalanceResponse);
                    setR(!r);
                  } catch (e) {
                    console.log(e);
                  }
                }}
              >
                <span>Connect Wallet</span>
                <Icons.wallet className="h-5 w-5" />
              </Button>
            ) : (
              !!balance && (
                <div className="flex w-full justify-between gap-4 ">
                  <p className="rounded-[10px] bg-white p-2 font-bold text-[#1B1B1B]">{`tokenA:${balance[0]}`}</p>
                  <p className="rounded-[10px] bg-white p-2 font-bold text-[#1B1B1B]">{`tokenB:${balance[1]}`}</p>
                </div>
              )
            )}
          </div>

          <div className="relative  flex flex-col items-center gap-4">
            <div
              className={cn(
                "flex  items-center gap-8",
                transfering && "invisible",
              )}
            >
              <div className="flex min-w-[25vw]   items-center  gap-4 rounded-[20px] border border-[#424242] bg-[#212121] px-4 py-6">
                <div className="h-16 w-16 rounded-full bg-red-400"></div>
                <div className="flex flex-col gap-1">
                  <div className=" text-4xl">{tokens[0].symbol}</div>
                  <div className="text-xl text-[#A4A4A4]">{tokens[0].name}</div>
                </div>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#424242] bg-[#212121] p-4">
                <Icons.arrow className=" text-[#A4A4A4]" />
              </div>
              <div className="flex min-w-[25vw]   items-center  gap-4 rounded-[20px] border border-[#424242] bg-[#212121] px-4 py-6">
                <div className="h-16 w-16 rounded-full bg-green-400"></div>
                <div className="flex flex-col gap-1">
                  <div className=" text-4xl">{tokens[1].symbol}</div>
                  <div className="text-xl text-[#A4A4A4]">{tokens[1].name}</div>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "flex w-full items-center justify-between  gap-8 rounded-[20px] border border-[#424242] bg-[#212121] px-4 py-6",
                transfering && "invisible",
              )}
            >
              <div className="flex   items-center gap-4 text-[#A4A4A4]">
                <div className="h-10 w-10 rounded-full bg-red-400 "></div>
                <div className="flex flex-col gap-1">
                  <Input
                    disabled={!tokens[0].from}
                    className="w-1/2 max-w-64 bg-transparent pl-0 text-4xl"
                    value={inp}
                    onChange={(e) => {
                      if (!/[a-zA-Z]/.test(e.target.value)) {
                        sInp(e.target.value);
                        setTokens([
                          {
                            ...tokens[0],
                            quantity:
                              parseFloat(
                                parseFloat(e.target.value).toFixed(4),
                              ) || 0,
                            usd:
                              parseFloat(
                                parseFloat(e.target.value).toFixed(4),
                              ) * 3 || 0,
                          },
                          {
                            ...tokens[1],
                            quantity:
                              parseFloat(
                                parseFloat(e.target.value).toFixed(4),
                              ) || 0,
                            usd:
                              parseFloat(
                                parseFloat(e.target.value).toFixed(4),
                              ) * 3 || 0,
                          },
                        ]);
                      }
                    }}
                  />
                  <div className="ml-0.5 w-fit text-xl">{`$${tokens[0].usd.toFixed(4)}`}</div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4">
                <div className="flex flex-col  items-end gap-1 text-right text-[#A4A4A4]">
                  <Input
                    onChange={(e) => {
                      setTokens([
                        tokens[0],
                        {
                          ...tokens[1],
                          quantity: parseFloat(e.target.value),
                        },
                      ]);
                    }}
                    disabled={!tokens[1].from}
                    className="w-1/2 max-w-64 bg-transparent px-0 text-right text-4xl disabled:cursor-default disabled:opacity-100"
                    value={tokens[1].quantity}
                  />
                  <div className="mr-0.5 w-fit text-xl">{`$${tokens[0].usd.toFixed(4)}`}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-400"></div>
              </div>
            </div>
            <Icons.dollar
              className={cn(
                "absolute left-1/2 top-1/2 block h-20 w-20 -translate-x-1/2 -translate-y-1/2",
                !transfering && "invisible",
              )}
            />
          </div>
          <Button
            className="w-full rounded-xl py-6 text-xl font-bold"
            disabled={transfering}
            onClick={() => {
              setTransfering(true);
              console.log(tokens[0].quantity, tokens[1].quantity);
              setTokens([
                { ...tokens[0], quantity: 0, usd: 0 },
                { ...tokens[1], quantity: 0, usd: 0 },
              ]);
              sInp("0.0");
              (async () => {
                const cid = "br5f7-7uaaa-aaaaa-qaaca-cai";
                const whitelist = [cid];

                // Initialise Agent, expects no return value
                await ic?.requestConnect({
                  whitelist,
                });
                // const actor = await ic.createActor({
                //   canisterId: cid,
                //   interfaceFactory: idlFactory,
                // });
                // await actor.swap();
              })();
              setTimeout(() => {
                setTransfering(false);
                setBalance([
                  balance[0] - tokens[0].quantity,
                  balance[1] + tokens[1].quantity,
                ]);
              }, 5000);
            }}
          >
            {!transfering ? (
              <span>Swap Token</span>
            ) : (
              // <Icons.spinner className="h-8 w-8" />
              "Swapping..."
            )}
          </Button>
        </div>
      </main>
    </>
  );
}
