--[[
#########################################################################
#                                                                       #
# Battery ID Selector Widget for EdgeTX                                 #
# Allows selecting a battery and logs the ID to telemetry               #
#                                                                       #
# Battery data is loaded from batteries.lua file exported from the      #
# Logbook application. Place the file in /WIDGETS/BatteryID/            #
#                                                                       #
# The selected battery's database ID is pushed to telemetry logs        #
# as "BatID" for automatic matching during flight import.               #
#                                                                       #
#########################################################################
]]

local app_name = "BatteryID"

-- Try to load batteries from exported file
local BATTERY_DATA = {}
local function loadBatteryData()
    local chunk = loadfile("/WIDGETS/BatteryID/batteries.lua")
    if chunk then
        local ok, data = pcall(chunk)
        if ok and type(data) == "table" then
            BATTERY_DATA = data
            print("BatteryID: Loaded battery data from file")
        else
            print("BatteryID: Failed to parse batteries.lua")
        end
    else
        print("BatteryID: batteries.lua not found, using defaults")
    end
end

-- Load on startup
loadBatteryData()

--[[
================================================================================
FALLBACK BATTERY MAP (used if batteries.lua is not present)
================================================================================
]]
local FALLBACK_MAP = {
    ["_default"] = {
        { id = 0, name = "Batt-1" },
        { id = 0, name = "Batt-2" },
        { id = 0, name = "Batt-3" },
    },
}

-- Widget options
local options = {
    { "GV_index", VALUE, 9, 1, 9 },      -- Which GV to use (GV1-GV9), default GV9
    { "text_color", COLOR, WHITE },
}

local function translate(name)
    local translations = {
        GV_index = "Global Variable (1-9)",
        text_color = "Text Color",
    }
    return translations[name]
end

-- Get batteries for current model
local function getBatteriesForModel()
    local model_name = model.getInfo().name
    
    -- Try loaded data first, then fallback
    local batteries = BATTERY_DATA[model_name]
    if batteries == nil then
        batteries = BATTERY_DATA["_default"]
    end
    if batteries == nil then
        batteries = FALLBACK_MAP[model_name]
    end
    if batteries == nil then
        batteries = FALLBACK_MAP["_default"]
    end
    
    -- Prepend "None" option with id=0
    local result = { { id = 0, name = "None" } }
    for i, bat in ipairs(batteries or {}) do
        result[#result + 1] = bat
    end
    return result
end

local function create(zone, options)
    local wgt = {
        zone = zone,
        options = options,
        batteries = getBatteriesForModel(),
    }
    return wgt
end

local function update(wgt, options)
    wgt.options = options
    -- Reload battery data in case file was updated
    loadBatteryData()
    wgt.batteries = getBatteriesForModel()
end

-- Get current battery index from Global Variable
local function getBatteryIndex(wgt)
    local gv_idx = (wgt.options.GV_index or 9) - 1  -- GV index is 0-based
    local idx = model.getGlobalVariable(gv_idx, 0)
    -- Clamp to valid range
    if idx == nil or idx < 0 then idx = 0 end
    if idx >= #wgt.batteries then idx = #wgt.batteries - 1 end
    return idx
end

-- Set battery index in Global Variable
local function setBatteryIndex(wgt, idx)
    local gv_idx = (wgt.options.GV_index or 9) - 1
    model.setGlobalVariable(gv_idx, 0, idx)
end

-- Get battery entry for current selection
local function getBattery(wgt)
    local idx = getBatteryIndex(wgt)
    return wgt.batteries[idx + 1] or { id = 0, name = "None" }  -- Lua arrays are 1-based
end

-- Push battery info to telemetry
-- Pushes the database ID directly for automatic matching in Logbook
local function pushToTelemetry(wgt)
    local battery = getBattery(wgt)
    
    -- Push database ID (0 = None/no battery)
    setTelemetryValue(0x5101, 0, 0, battery.id, 0, 0, "BatID")
end

local function background(wgt)
    pushToTelemetry(wgt)
end

local function refresh(wgt, event, touchState)
    background(wgt)
    
    local idx = getBatteryIndex(wgt)
    local battery = getBattery(wgt)
    local zone = wgt.zone
    local color = wgt.options.text_color
    local max_idx = #wgt.batteries - 1
    
    -- Determine font size based on widget size
    local font = MIDSIZE
    local font_small = SMLSIZE
    if zone.h < 50 then
        font = SMLSIZE
        font_small = SMLSIZE
    elseif zone.h > 100 then
        font = DBLSIZE
        font_small = MIDSIZE
    end
    
    -- Draw header
    lcd.drawText(zone.x + 2, zone.y + 2, "Battery:", color + font_small)
    
    -- Draw battery name
    local name = battery.name
    local tw, th = lcd.sizeText(name, font)
    -- If text is too wide, use smaller font
    if tw > zone.w - 10 then
        font = SMLSIZE
        tw, th = lcd.sizeText(name, font)
    end
    lcd.drawText(zone.x + (zone.w - tw) / 2, zone.y + (zone.h - th) / 2 + 5, name, color + font)
    
    -- Only handle events in full-screen mode (when event is provided and non-zero)
    -- On main screen, event is nil or 0, so we skip input handling
    if event and event ~= 0 then
        -- Handle touch events for increment/decrement
        if EVT_TOUCH_TAP and event == EVT_TOUCH_TAP and touchState then
            local tx = touchState.x - zone.x
            
            -- Left half decrements, right half increments
            if tx < zone.w / 2 then
                local new_idx = idx - 1
                if new_idx < 0 then new_idx = max_idx end
                setBatteryIndex(wgt, new_idx)
                playTone(400, 50, 0)
            else
                local new_idx = idx + 1
                if new_idx > max_idx then new_idx = 0 end
                setBatteryIndex(wgt, new_idx)
                playTone(600, 50, 0)
            end
        end
        
        -- Handle rotary encoder / button events (only if constants are defined)
        local isIncrement = (EVT_ROT_RIGHT and event == EVT_ROT_RIGHT) or
                           (EVT_PLUS_FIRST and event == EVT_PLUS_FIRST) or
                           (EVT_PLUS_RPT and event == EVT_PLUS_RPT) or
                           (EVT_VIRTUAL_INC and event == EVT_VIRTUAL_INC)
        local isDecrement = (EVT_ROT_LEFT and event == EVT_ROT_LEFT) or
                           (EVT_MINUS_FIRST and event == EVT_MINUS_FIRST) or
                           (EVT_MINUS_RPT and event == EVT_MINUS_RPT) or
                           (EVT_VIRTUAL_DEC and event == EVT_VIRTUAL_DEC)
        
        if isIncrement then
            local new_idx = idx + 1
            if new_idx > max_idx then new_idx = 0 end
            setBatteryIndex(wgt, new_idx)
        elseif isDecrement then
            local new_idx = idx - 1
            if new_idx < 0 then new_idx = max_idx end
            setBatteryIndex(wgt, new_idx)
        end
    end
    
    -- Draw increment/decrement hints and counter if widget is large enough
    if zone.h > 60 and zone.w > 80 then
        lcd.drawText(zone.x + 5, zone.y + zone.h - 15, "<", color + SMLSIZE)
        lcd.drawText(zone.x + zone.w - 15, zone.y + zone.h - 15, ">", color + SMLSIZE)
        -- Show position indicator
        local pos_text = string.format("%d/%d", idx, max_idx)
        local ptw, _ = lcd.sizeText(pos_text, SMLSIZE)
        lcd.drawText(zone.x + (zone.w - ptw) / 2, zone.y + zone.h - 15, pos_text, color + SMLSIZE)
    end
end

return {
    name = app_name,
    options = options,
    translate = translate,
    create = create,
    update = update,
    refresh = refresh,
    background = background
}
