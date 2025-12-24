export interface StatsRoot {
    stats: StatsStats;
    DataVersion: number;
}

export interface StatsStats {
    'minecraft:broken': Record<string, number>;
    'minecraft:killed': Record<string, number>;
    'minecraft:killed_by': Record<string, number>;
    'minecraft:mined': Record<string, number>;
    'minecraft:picked_up': Record<string, number>;
    'minecraft:used': Record<string, number>;
    'minecraft:crafted': Record<string, number>;
    'minecraft:dropped': Record<string, number>;
    'minecraft:custom': StatsMinecraftCustom;
}

export interface StatsMinecraftCustom {
    'minecraft:time_since_rest': number;
    'minecraft:leave_game': number;
    'minecraft:boat_one_cm': number;
    'minecraft:time_since_death': number;
    'minecraft:aviate_one_cm': number;
    'minecraft:interact_with_furnace': number;
    'minecraft:total_world_time': number;
    'minecraft:crouch_one_cm': number;
    'minecraft:climb_one_cm': number;
    'minecraft:deaths': number;
    'minecraft:interact_with_stonecutter': number;
    'minecraft:fish_caught': number;
    'minecraft:animals_bred': number;
    'minecraft:minecart_one_cm': number;
    'minecraft:traded_with_villager': number;
    'minecraft:damage_resisted': number;
    'minecraft:interact_with_crafting_table': number;
    'minecraft:inspect_dropper': number;
    'minecraft:walk_one_cm': number;
    'minecraft:walk_under_water_one_cm': number;
    'minecraft:horse_one_cm': number;
    'minecraft:damage_dealt': number;
    'minecraft:play_time': number;
    'minecraft:jump': number;
    'minecraft:play_record': number;
    'minecraft:sprint_one_cm': number;
    'minecraft:fill_cauldron': number;
    'minecraft:inspect_hopper': number;
    'minecraft:fly_one_cm': number;
    'minecraft:walk_on_water_one_cm': number;
    'minecraft:interact_with_grindstone': number;
    'minecraft:talked_to_villager': number;
    'minecraft:mob_kills': number;
    'minecraft:damage_taken': number;
    'minecraft:open_shulker_box': number;
    'minecraft:interact_with_beacon': number;
    'minecraft:open_enderchest': number;
    'minecraft:interact_with_brewingstand': number;
    'minecraft:interact_with_smithing_table': number;
    'minecraft:sleep_in_bed': number;
    'minecraft:inspect_dispenser': number;
    'minecraft:swim_one_cm': number;
    'minecraft:pot_flower': number;
    'minecraft:enchant_item': number;
    'minecraft:interact_with_loom': number;
    'minecraft:drop': number;
    'minecraft:open_barrel': number;
    'minecraft:open_chest': number;
    'minecraft:fall_one_cm': number;
    'minecraft:interact_with_anvil': number;
    'minecraft:sneak_time': number;
}
