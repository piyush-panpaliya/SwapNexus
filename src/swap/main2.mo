import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";

import ICRC "./ICRC";

shared (init_msg) actor class Swap() = this {

  let minerPricipal : Text = "iqkqe-wggkk-zooql-baz6j-4so36-ola2k-lct77-2yyoa-27gw3-nldiw-yae";
  public type SwapArgs = {
    spender_subaccount : ?Blob;
    tokenFrom : Principal;
    tokenTo : Principal;
    from : ICRC.Account;
    amount : Nat;
    fee : ?Nat;
    memo : ?Blob;
    created_at_time : ?Nat64;
  };

  public type SwapError = {
    #TransferFromError : ICRC.TransferFromError;
  };

  public shared (_msg) func swap(args : SwapArgs) : async Result.Result<Nat, SwapError> {
    let tokenFrom : ICRC.Actor = actor (Principal.toText(args.tokenFrom));
    let tokenTo : ICRC.Actor = actor (Principal.toText(args.tokenTo));

    let feeFrom = switch (args.fee) {
      case (?f) { f };
      case (null) { await tokenTo.icrc1_fee() };
    };
    let feeTo = switch (args.fee) {
      case (?f) { f };
      case (null) { await tokenFrom.icrc1_fee() };
    };

    let transfer_result = await tokenFrom.icrc2_transfer_from({
      spender_subaccount = args.spender_subaccount;
      from = args.from;
      to = { owner = Principal.fromActor(this); subaccount = null };
      amount = args.amount;
      fee = ?feeFrom;
      memo = args.memo;
      created_at_time = args.created_at_time;
    });

    let _block_height = switch (transfer_result) {
      case (#Ok(block_height)) { block_height };
      case (#Err(err)) {
        return #err(#TransferFromError(err));
      };
    };

    let fee = ?0;
    let transferToBurn = await tokenFrom.icrc1_transfer({
      from_subaccount = null;
      to = {
        owner = Principal.fromText(minerPricipal);
        subaccount = null;
      };
      amount = args.amount;
      fee = fee;
      memo = args.memo;
      created_at_time = args.created_at_time;
    });

    let _burnHeight = switch (transferToBurn) {
      case (#Ok(burnHeight)) { burnHeight };
      case (#Err(err)) {
        let _res = await tokenFrom.icrc1_transfer({
          from_subaccount = null;
          to = args.from;
          amount = args.amount;
          fee = ?feeTo;
          memo = args.memo;
          created_at_time = args.created_at_time;
        });
        return #err(#TransferFromError(err));
      };
    };
    let transferFromMint = await tokenTo.icrc2_transfer_from({
      from = {
        owner = Principal.fromText(minerPricipal);
        subaccount = null;
      };
      spender_subaccount = null;
      to = args.from;
      amount = args.amount;
      fee = ?feeTo;
      memo = args.memo;
      created_at_time = args.created_at_time;
    });

    let mintHeight = switch (transferFromMint) {
      case (#Ok(mintHeight)) { mintHeight };
      case (#Err(err)) {
        let _res = await tokenFrom.icrc1_transfer({
          from_subaccount = null;
          to = args.from;
          amount = args.amount;
          fee = ?feeFrom;
          memo = args.memo;
          created_at_time = args.created_at_time;
        });
        return #err(#TransferFromError(err));
      };
    };

    #ok(mintHeight);
  };
};
